"""
AlpaRodh PARAM Mapper — PM100 to PARAM Yuva-II architecture mapping.

Maps power profiles from the Marconi100 (PM100) dataset to PARAM Yuva-II 
(CDAC Pune) architecture, accounting for differences in CPU TDP, GPU specs,
and node configurations.
"""

import numpy as np
import pandas as pd

from . import config
import logging
logger = logging.getLogger(__name__)



def get_hardware_comparison():
    """
    Generate a side-by-side comparison of PM100 vs PARAM Yuva-II specs.
    
    Returns:
        dict: Structured comparison data.
    """
    pm100 = config.PM100_SPECS
    param = config.PARAM_YUVA_II_SPECS

    return {
        "pm100": {
            "name": pm100["name"],
            "location": pm100["location"],
            "cpu": pm100["cpu"],
            "cpu_tdp": pm100["cpu_tdp_w"],
            "gpu": pm100["gpu"],
            "gpu_tdp": pm100["gpu_tdp_w"],
            "node_count": pm100["node_count"],
            "peak_performance": f"{pm100['peak_pflops']} PFlops",
        },
        "param_yuva_ii": {
            "name": param["name"],
            "location": param["location"],
            "cpu_node_cpu": param["cpu_node"]["cpu"],
            "cpu_node_tdp": param["cpu_node"]["cpu_tdp_w"],
            "gpu_node_cpu": param["gpu_node"]["cpu"],
            "gpu_node_gpu": param["gpu_node"]["gpu"],
            "gpu_node_gpu_tdp": param["gpu_node"]["gpu_tdp_w"],
            "total_cpu_nodes": param["total_cpu_nodes"],
            "total_gpu_nodes": param["total_gpu_nodes"],
            "peak_performance": f"{param['peak_tflops']} TFlops",
        },
    }


def calculate_scaling_factors():
    """
    Calculate power scaling factors between PM100 and PARAM Yuva-II.
    
    Scaling is based on TDP (Thermal Design Power) ratios between
    corresponding hardware components.
    
    Returns:
        dict: Scaling factors for CPU-only and GPU nodes.
    """
    pm100 = config.PM100_SPECS
    param = config.PARAM_YUVA_II_SPECS

    # CPU scaling: PARAM Xeon E5-2670 TDP / PM100 POWER9 TDP
    cpu_scale = param["cpu_node"]["cpu_tdp_w"] / pm100["cpu_tdp_w"]

    # GPU node CPU scaling: Xeon E5-2650 / POWER9
    gpu_cpu_scale = param["gpu_node"]["cpu_tdp_w"] / pm100["cpu_tdp_w"]

    # GPU scaling: Tesla M2090 / Tesla V100
    gpu_scale = param["gpu_node"]["gpu_tdp_w"] / pm100["gpu_tdp_w"]

    # Node-level scaling (accounting for different GPU counts)
    # PM100: 4 GPUs per node, PARAM GPU: 2 GPUs per node
    gpu_count_ratio = param["gpu_node"]["gpus_per_node"] / pm100["gpus_per_node"]

    # Overall node power scaling
    cpu_node_scale = cpu_scale  # CPU-only nodes scale by CPU TDP ratio
    gpu_node_scale = (gpu_cpu_scale + gpu_scale * gpu_count_ratio) / 2  # weighted average

    logger.info(f"📐 Scaling Factors:")
    logger.info(f"   CPU Node Scale: {cpu_node_scale:.4f} (PARAM/PM100)")
    logger.info(f"   GPU Node Scale: {gpu_node_scale:.4f} (PARAM/PM100)")

    return {
        "cpu_tdp_ratio": round(cpu_scale, 4),
        "gpu_tdp_ratio": round(gpu_scale, 4),
        "gpu_count_ratio": round(gpu_count_ratio, 4),
        "cpu_node_scale": round(cpu_node_scale, 4),
        "gpu_node_scale": round(gpu_node_scale, 4),
    }


def classify_node_type(df):
    """
    Classify each job as running on CPU-only or GPU-accelerated nodes.
    
    Heuristic: Jobs with GPU allocation > 0 are GPU jobs.
    If GPU allocation column is missing, use power signature:
    high node power relative to CPU power suggests GPU usage.
    
    Args:
        df: DataFrame with job telemetry.
    
    Returns:
        pd.Series: 'cpu_only' or 'gpu_accel' for each job.
    """
    if "num_gpus_alloc" in df.columns:
        node_type = np.where(df["num_gpus_alloc"] > 0, "gpu_accel", "cpu_only")
    else:
        # Heuristic: if node power > 3x CPU power, likely GPU-accelerated
        node_type = np.where(
            df["node_pwr_w"] > 3 * df["cpu_pwr_w"],
            "gpu_accel",
            "cpu_only"
        )

    types = pd.Series(node_type, index=df.index)
    cpu_count = int((types == "cpu_only").sum())
    gpu_count = int((types == "gpu_accel").sum())
    logger.info(f"🖥️  Node Classification: {cpu_count} CPU-only, {gpu_count} GPU-accelerated")

    return types


def map_to_param_yuva(df):
    """
    Map PM100 power values to PARAM Yuva-II scale.
    
    Creates new columns with PARAM-equivalent power values using
    hardware-based scaling factors.
    
    Args:
        df: DataFrame with PM100 power data.
    
    Returns:
        tuple: (df with PARAM columns, mapping_summary)
    """
    df = df.copy()
    scales = calculate_scaling_factors()
    node_types = classify_node_type(df)
    df["node_type"] = node_types

    # Apply appropriate scaling per node type
    df["param_pwr_w"] = np.where(
        df["node_type"] == "gpu_accel",
        df["node_pwr_w"] * scales["gpu_node_scale"],
        df["node_pwr_w"] * scales["cpu_node_scale"],
    )

    df["param_energy_wh"] = (df["param_pwr_w"] * df["run_time"]) / config.WATT_HOUR_DIVISOR

    param_baseline_kwh = df["param_energy_wh"].sum() / 1000
    pm100_baseline_kwh = df["energy_wh"].sum() / 1000

    logger.info(f"\n📊 PARAM Yuva-II Projection:")
    logger.info(f"   PM100 Baseline:  {pm100_baseline_kwh:.2f} kWh")
    logger.info(f"   PARAM Projected: {param_baseline_kwh:.2f} kWh")

    summary = {
        "scaling_factors": scales,
        "node_types": {
            "cpu_only": int((node_types == "cpu_only").sum()),
            "gpu_accel": int((node_types == "gpu_accel").sum()),
        },
        "pm100_baseline_kwh": round(pm100_baseline_kwh, 2),
        "param_baseline_kwh": round(param_baseline_kwh, 2),
        "scale_ratio": round(param_baseline_kwh / pm100_baseline_kwh, 4) if pm100_baseline_kwh > 0 else 0,
    }

    return df, summary


def project_param_savings(savings_kwh, mapping_summary):
    """
    Project AlpaRodh savings onto PARAM Yuva-II scale.
    
    Args:
        savings_kwh: Savings achieved on PM100 data.
        mapping_summary: Output from map_to_param_yuva().
    
    Returns:
        dict: Projected savings for PARAM Yuva-II.
    """
    scale = mapping_summary["scale_ratio"]
    param_savings = savings_kwh * scale

    # Also compute with Indian CO2 factor
    co2_saved_india = param_savings * config.CO2_FACTOR_INDIA / 1000  # kg

    logger.info(f"🇮🇳 Projected PARAM Savings: {param_savings:.2f} kWh")
    logger.info(f"🌿 CO₂ Prevented (Indian grid): {co2_saved_india:.2f} kg")

    return {
        "param_savings_kwh": round(param_savings, 2),
        "co2_saved_india_kg": round(co2_saved_india, 2),
        "scale_factor_used": scale,
    }
