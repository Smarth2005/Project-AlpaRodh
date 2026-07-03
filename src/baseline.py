"""
AlpaRodh Baseline — Energy baseline calculations.

Computes the total energy consumption (kWh) from power and runtime data,
separates static vs variable energy, and detects allocation mismatches.
"""

import pandas as pd
import numpy as np

from . import config
import logging
logger = logging.getLogger(__name__)



def calculate_energy(df):
    """
    Calculate energy consumption for each job and total baseline.
    
    Formula: Energy (Wh) = Power (W) × RunTime (s) / 3600
    
    Args:
        df: Cleaned dataframe with 'node_pwr_w' and 'run_time' columns.
    
    Returns:
        tuple: (df with 'energy_wh' column added, total_baseline_kwh)
    """
    df = df.copy()
    df["energy_wh"] = (df["node_pwr_w"] * df["run_time"]) / config.WATT_HOUR_DIVISOR
    total_baseline_kwh = df["energy_wh"].sum() / 1000

    logger.info(f"⚡ Total Baseline Energy: {total_baseline_kwh:.2f} kWh")
    return df, total_baseline_kwh


def calculate_variable_energy(df, static_floor=None):
    """
    Separate static (fixed resistance) and variable (dynamic) energy.
    
    Static power = the minimum observed power draw (idle circuitry, fans).
    Variable power = everything above static — this is what AlpaRodh optimizes.
    
    Args:
        df: DataFrame with 'node_pwr_w' and 'run_time'.
        static_floor: Override for static floor (W). If None, uses data minimum.
    
    Returns:
        tuple: (df with variable columns, total_variable_kwh, static_floor_w)
    """
    df = df.copy()

    if static_floor is None:
        static_floor = float(df["node_pwr_w"].min())
    
    df["static_pwr_w"] = static_floor
    df["variable_pwr_w"] = (df["node_pwr_w"] - static_floor).clip(lower=0)
    df["variable_energy_wh"] = (df["variable_pwr_w"] * df["run_time"]) / config.WATT_HOUR_DIVISOR

    total_variable_kwh = df["variable_energy_wh"].sum() / 1000

    logger.info(f"🔌 Static Floor: {static_floor:.2f} W")
    logger.info(f"📊 Total Variable Energy (dynamic resistance): {total_variable_kwh:.2f} kWh")

    return df, total_variable_kwh, static_floor


def detect_mismatches(df):
    """
    Identify jobs where allocated cores exceed requested cores.
    
    Over-allocation leads to "Static Power Waste" — cores sitting idle
    but still drawing power (variable resistance not being utilized).
    
    Args:
        df: DataFrame with 'num_cores_req' and 'num_cores_alloc' columns.
    
    Returns:
        tuple: (mismatch_mask, mismatch_count, over_alloc_mask, over_alloc_count)
    """
    mismatch_mask = df["num_cores_req"] != df["num_cores_alloc"]
    mismatch_count = int(mismatch_mask.sum())

    over_alloc_mask = df["num_cores_alloc"] > df["num_cores_req"]
    over_alloc_count = int(over_alloc_mask.sum())

    logger.info(f"🔍 Jobs with core allocation mismatch: {mismatch_count}")
    logger.info(f"⚠️  Jobs over-allocated (waste source): {over_alloc_count}")

    return mismatch_mask, mismatch_count, over_alloc_mask, over_alloc_count


def get_baseline_summary(df, total_baseline_kwh, total_variable_kwh, static_floor, mismatch_count):
    """
    Generate a complete baseline summary dictionary.
    
    Args:
        df: Full dataframe.
        total_baseline_kwh: Total baseline energy in kWh.
        total_variable_kwh: Variable energy component in kWh.
        static_floor: Static floor power in watts.
        mismatch_count: Number of mismatched jobs.
    
    Returns:
        dict: Complete baseline summary.
    """
    total_static_kwh = total_baseline_kwh - total_variable_kwh
    
    return {
        "total_jobs": len(df),
        "total_baseline_kwh": round(total_baseline_kwh, 2),
        "total_variable_kwh": round(total_variable_kwh, 2),
        "total_static_kwh": round(total_static_kwh, 2),
        "variable_percent": round(total_variable_kwh / total_baseline_kwh * 100, 2) if total_baseline_kwh > 0 else 0,
        "static_floor_w": round(static_floor, 4),
        "mean_node_power_w": round(float(df["node_pwr_w"].mean()), 2),
        "max_node_power_w": round(float(df["node_pwr_w"].max()), 2),
        "mismatch_count": mismatch_count,
        "mismatch_percent": round(mismatch_count / len(df) * 100, 2) if len(df) > 0 else 0,
    }
