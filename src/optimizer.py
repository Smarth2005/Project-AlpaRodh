"""
AlpaRodh Optimizer — Energy optimization strategies.

Implements three complementary strategies to reduce variable resistance:
1. Core-Park: Power-gate idle cores in over-allocated jobs
2. DVFS: Reduce frequency for memory-bound workloads
3. Job Consolidation: Score bin-packing efficiency
"""

import numpy as np
import pandas as pd

from . import config
import logging
logger = logging.getLogger(__name__)



# ─── Strategy 1: Core-Park Optimization ─────────────────────────────────────

def core_park_optimization(df, reduction_factor=None):
    """
    Simulate Core-Park (Power-Gating) strategy for over-allocated jobs.
    
    When a job requests N cores but is allocated M > N cores, the (M - N)
    excess cores are "parked" — their voltage is gated, reducing power draw.
    
    This directly reduces variable resistance by eliminating idle core power.
    
    Args:
        df: DataFrame with node_pwr_w, num_cores_req, num_cores_alloc.
        reduction_factor: Power reduction per idle core (default from config).
    
    Returns:
        tuple: (df with 'corepark_pwr_w' column, savings_kwh, savings_percent)
    """
    df = df.copy()
    if reduction_factor is None:
        reduction_factor = config.CORE_PARK_REDUCTION

    def _optimize_row(row):
        if row["num_cores_alloc"] > row["num_cores_req"] and row["num_cores_req"] > 0:
            waste_ratio = (row["num_cores_alloc"] - row["num_cores_req"]) / row["num_cores_alloc"]
            return row["node_pwr_w"] * (1 - waste_ratio * reduction_factor)
        return row["node_pwr_w"]

    df["corepark_pwr_w"] = df.apply(_optimize_row, axis=1)
    df["corepark_energy_wh"] = (df["corepark_pwr_w"] * df["run_time"]) / config.WATT_HOUR_DIVISOR

    baseline_kwh = df["energy_wh"].sum() / 1000
    optimized_kwh = df["corepark_energy_wh"].sum() / 1000
    savings_kwh = baseline_kwh - optimized_kwh
    savings_pct = (savings_kwh / baseline_kwh * 100) if baseline_kwh > 0 else 0

    logger.info(f"🅿️  Core-Park Savings: {savings_kwh:.2f} kWh ({savings_pct:.2f}%)")
    return df, savings_kwh, savings_pct


# ─── Strategy 2: DVFS Simulation ────────────────────────────────────────────

def dvfs_simulation(df):
    """
    Simulate Dynamic Voltage and Frequency Scaling (DVFS) for memory-bound jobs.
    
    Memory-bound jobs spend most time waiting for memory I/O, not computing.
    Reducing CPU frequency for these jobs saves power with minimal performance impact.
    
    Identification: mem_power / cpu_power > MEMORY_BOUND_THRESHOLD
    
    Power savings follow a cubic relationship: P ∝ f³ (approximately)
    A 20% frequency reduction yields ~12% power reduction.
    
    Args:
        df: DataFrame with cpu_pwr_w, mem_pwr_w, node_pwr_w columns.
    
    Returns:
        tuple: (df with 'dvfs_pwr_w' column, savings_kwh, savings_percent, mem_bound_count)
    """
    df = df.copy()

    # Identify memory-bound jobs
    cpu_power = df["cpu_pwr_w"].replace(0, np.nan)
    mem_ratio = df["mem_pwr_w"] / cpu_power
    mem_bound_mask = mem_ratio > config.MEMORY_BOUND_THRESHOLD
    mem_bound_count = int(mem_bound_mask.sum())

    # Apply DVFS power reduction only to CPU power of memory-bound jobs
    df["dvfs_pwr_w"] = df["node_pwr_w"].copy()
    cpu_saving = df.loc[mem_bound_mask, "cpu_pwr_w"] * config.DVFS_POWER_SAVING
    df.loc[mem_bound_mask, "dvfs_pwr_w"] -= cpu_saving

    df["dvfs_energy_wh"] = (df["dvfs_pwr_w"] * df["run_time"]) / config.WATT_HOUR_DIVISOR

    baseline_kwh = df["energy_wh"].sum() / 1000
    optimized_kwh = df["dvfs_energy_wh"].sum() / 1000
    savings_kwh = baseline_kwh - optimized_kwh
    savings_pct = (savings_kwh / baseline_kwh * 100) if baseline_kwh > 0 else 0

    logger.info(f"🔄 DVFS — Memory-bound jobs: {mem_bound_count}")
    logger.info(f"🔄 DVFS Savings: {savings_kwh:.2f} kWh ({savings_pct:.2f}%)")
    return df, savings_kwh, savings_pct, mem_bound_count


# ─── Strategy 3: Job Consolidation Score ────────────────────────────────────

def job_consolidation_score(df):
    """
    Calculate a job consolidation efficiency score.
    
    Measures how well jobs could be packed onto fewer nodes, allowing
    remaining nodes to enter deep sleep (zero variable resistance).
    
    Score = 1 - (actual_node_hours / ideal_node_hours)
    Higher score = more room for consolidation = more potential savings.
    
    Args:
        df: DataFrame with num_cores_alloc, num_cores_req, run_time.
    
    Returns:
        tuple: (consolidation_score, potential_savings_kwh)
    """
    # Total core-seconds allocated vs requested
    total_alloc_core_s = (df["num_cores_alloc"] * df["run_time"]).sum()
    total_req_core_s = (df["num_cores_req"] * df["run_time"]).sum()

    if total_alloc_core_s == 0:
        return 0.0, 0.0

    consolidation_score = 1 - (total_req_core_s / total_alloc_core_s)
    consolidation_score = max(0, min(1, consolidation_score))  # clamp [0, 1]

    # Estimate potential savings from perfect consolidation
    # If we could perfectly pack jobs, the idle node power would be eliminated
    baseline_kwh = df["energy_wh"].sum() / 1000
    potential_savings = baseline_kwh * consolidation_score * 0.10  # conservative 10%

    logger.info(f"📦 Consolidation Score: {consolidation_score:.4f} ({consolidation_score*100:.2f}%)")
    logger.info(f"📦 Potential Consolidation Savings: {potential_savings:.2f} kWh")
    return consolidation_score, potential_savings


# ─── Combined Optimization ──────────────────────────────────────────────────

def apply_all_optimizations(df):
    """
    Apply all three optimization strategies and compute combined savings.
    
    The combined optimized power is the minimum of all strategies applied
    independently (they target different job subsets, so savings are additive
    for non-overlapping jobs).
    
    Args:
        df: DataFrame with energy_wh and all required columns.
    
    Returns:
        dict: Complete optimization results summary.
    """
    # Apply each strategy
    df, cp_savings, cp_pct = core_park_optimization(df)
    df, dvfs_savings, dvfs_pct, mem_bound = dvfs_simulation(df)
    consol_score, consol_savings = job_consolidation_score(df)

    # Combined: take the minimum power from both strategies per row
    df["combined_pwr_w"] = df[["corepark_pwr_w", "dvfs_pwr_w"]].min(axis=1)
    df["combined_energy_wh"] = (df["combined_pwr_w"] * df["run_time"]) / config.WATT_HOUR_DIVISOR

    baseline_kwh = df["energy_wh"].sum() / 1000
    combined_kwh = df["combined_energy_wh"].sum() / 1000
    combined_savings = baseline_kwh - combined_kwh
    combined_pct = (combined_savings / baseline_kwh * 100) if baseline_kwh > 0 else 0

    logger.info(f"\n🏆 === COMBINED AlpaRodh OPTIMIZATION ===")
    logger.info(f"🏆 Total Combined Savings: {combined_savings:.2f} kWh ({combined_pct:.2f}%)")

    return {
        "core_park": {
            "savings_kwh": round(cp_savings, 2),
            "savings_percent": round(cp_pct, 2),
        },
        "dvfs": {
            "savings_kwh": round(dvfs_savings, 2),
            "savings_percent": round(dvfs_pct, 2),
            "memory_bound_jobs": mem_bound,
        },
        "consolidation": {
            "score": round(consol_score, 4),
            "potential_savings_kwh": round(consol_savings, 2),
        },
        "combined": {
            "savings_kwh": round(combined_savings, 2),
            "savings_percent": round(combined_pct, 2),
            "optimized_total_kwh": round(combined_kwh, 2),
        },
        "dataframe": df,
    }
