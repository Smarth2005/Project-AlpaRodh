"""
AlpaRodh Data Loader — Parquet ingestion, flattening, and cleaning.

Handles the PM100 (Marconi100) telemetry dataset which may contain nested
arrays in power columns. Provides robust flattening and unit conversion.
"""

import os
import numpy as np
import pandas as pd

from . import config
import logging
logger = logging.getLogger(__name__)



def robust_flatten(x):
    """
    Flatten nested values from parquet telemetry columns.
    
    HPC telemetry sensors often store readings in lists/arrays.
    This function extracts the first scalar value from any nested structure.
    
    Args:
        x: A value that may be a scalar, list, numpy array, or NaN.
    
    Returns:
        A scalar numeric value (float/int), defaulting to 0 for empty/null.
    """
    if isinstance(x, (list, np.ndarray)):
        return x[0] if np.size(x) > 0 else 0
    if pd.isna(x):
        return 0
    return x


def load_and_clean(path=None):
    """
    Load the PM100 parquet dataset, flatten nested columns, and convert units.
    
    Pipeline:
        1. Load parquet file
        2. Apply robust_flatten to power columns (handle nested arrays)
        3. Convert milliwatts → watts
        4. Validate data (no negative power values)
    
    Args:
        path: Path to parquet file. Defaults to config.DATA_PATH.
    
    Returns:
        pd.DataFrame: Cleaned dataframe with original + watt-converted columns.
    
    Raises:
        FileNotFoundError: If the parquet file doesn't exist.
    """
    if path is None:
        path = config.DATA_PATH

    if not os.path.exists(path):
        raise FileNotFoundError(f"❌ Parquet file not found at: {path}")

    # Load dataset
    df = pd.read_parquet(path)
    logger.info(f"✅ Data loaded successfully. Total entries: {len(df)}")

    # Flatten nested array values in power columns
    for col in config.POWER_COLS:
        if col in df.columns:
            df[col] = df[col].apply(robust_flatten)
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    # Convert milliwatts to watts
    df["node_pwr_w"] = df["node_power_consumption"] / config.MILLIWATT_TO_WATT
    df["cpu_pwr_w"] = df["cpu_power_consumption"] / config.MILLIWATT_TO_WATT
    df["mem_pwr_w"] = df["mem_power_consumption"] / config.MILLIWATT_TO_WATT

    # Validate: no negative power values
    neg_count = (df[config.POWER_COLS] < 0).sum().sum()
    if neg_count > 0:
        logger.info(f"⚠️  Warning: {neg_count} negative power values found (set to 0)")
        for col in config.POWER_COLS:
            df[col] = df[col].clip(lower=0)

    return df


def get_summary_stats(df):
    """
    Generate a statistical summary of the power data.
    
    Args:
        df: Cleaned dataframe from load_and_clean().
    
    Returns:
        dict: Summary containing count, mean/std/min/max for each power column,
              plus run_time statistics and mismatch count.
    """
    power_stats = df[config.POWER_COLS_WATTS].describe().to_dict()
    
    total_jobs = len(df)
    
    # Core allocation mismatch analysis
    mismatch_count = 0
    if "num_cores_req" in df.columns and "num_cores_alloc" in df.columns:
        mismatch_count = int(
            (df["num_cores_alloc"] != df["num_cores_req"]).sum()
        )
    
    return {
        "total_jobs": total_jobs,
        "power_statistics": power_stats,
        "run_time_mean_s": float(df["run_time"].mean()) if "run_time" in df.columns else 0,
        "run_time_max_s": float(df["run_time"].max()) if "run_time" in df.columns else 0,
        "core_mismatch_count": mismatch_count,
        "core_mismatch_percent": round(mismatch_count / total_jobs * 100, 2) if total_jobs > 0 else 0,
    }
