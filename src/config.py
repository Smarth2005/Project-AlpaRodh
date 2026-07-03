"""
AlpaRodh Configuration — Project-wide constants and hardware specifications.

This module defines all configuration parameters for the AlpaRodh framework,
including dataset paths, power columns, hardware specifications for both
PM100 (Marconi100) and PARAM Yuva-II, and optimization parameters.
"""

import os

# ─── Paths ───────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "job_table.parquet")
MODELS_DIR = os.path.join(BASE_DIR, "models")
DASHBOARD_DATA_PATH = os.path.join(BASE_DIR, "dashboard", "data.json")

# ─── Dataset Columns ────────────────────────────────────────────────────────
POWER_COLS = [
    "node_power_consumption",
    "cpu_power_consumption",
    "mem_power_consumption",
]

POWER_COLS_WATTS = ["node_pwr_w", "cpu_pwr_w", "mem_pwr_w"]

CORE_COLS = ["num_cores_req", "num_cores_alloc"]

# ─── Unit Conversion ────────────────────────────────────────────────────────
# PM100 raw data is in milliwatts; divide by 1000 for Watts
MILLIWATT_TO_WATT = 1000
WATT_HOUR_DIVISOR = 3600  # seconds → hours

# ─── Hardware Specifications ────────────────────────────────────────────────

# PM100 / Marconi100 (CINECA, Italy) — Source system for our dataset
PM100_SPECS = {
    "name": "Marconi100 (PM100)",
    "location": "CINECA, Bologna, Italy",
    "cpu": "IBM POWER9",
    "cpu_tdp_w": 190,        # Thermal Design Power per CPU
    "cores_per_cpu": 16,
    "cpus_per_node": 2,
    "gpu": "NVIDIA Tesla V100",
    "gpu_tdp_w": 300,        # TDP per GPU
    "gpus_per_node": 4,
    "node_count": 980,
    "peak_pflops": 32.0,
    "node_idle_power_w": 250,   # Estimated idle power per node
    "node_max_power_w": 2200,   # Estimated max power per node
}

# PARAM Yuva-II (CDAC, Pune, India) — Target system we're mapping to
PARAM_YUVA_II_SPECS = {
    "name": "PARAM Yuva-II",
    "location": "CDAC, Pune, India",
    # CPU-only nodes
    "cpu_node": {
        "cpu": "Intel Xeon E5-2670",
        "cpu_tdp_w": 115,
        "cores_per_cpu": 8,
        "cpus_per_node": 2,
        "node_idle_power_w": 150,
        "node_max_power_w": 450,
    },
    # GPU-accelerated nodes
    "gpu_node": {
        "cpu": "Intel Xeon E5-2650",
        "cpu_tdp_w": 95,
        "cores_per_cpu": 8,
        "cpus_per_node": 2,
        "gpu": "NVIDIA Tesla M2090",
        "gpu_tdp_w": 225,
        "gpus_per_node": 2,
        "node_idle_power_w": 200,
        "node_max_power_w": 900,
    },
    "total_cpu_nodes": 340,
    "total_gpu_nodes": 36,
    "peak_tflops": 524.0,
}

# ─── CO₂ Emission Factors (gCO₂/kWh) ───────────────────────────────────────
# Source: IEA Emission Factors by Country

CO2_FACTOR_ITALY = 230      # Italy — for PM100/Marconi100 baseline
CO2_FACTOR_INDIA = 720      # India — for PARAM Yuva-II projections
CO2_FACTOR_GLOBAL_AVG = 475 # Global average for reference

# ─── Optimization Parameters ────────────────────────────────────────────────

# Core-Park strategy: percentage of power reduced per idle core
CORE_PARK_REDUCTION = 0.15  # Conservative 15% reduction for wasted allocation

# DVFS (Dynamic Voltage & Frequency Scaling)
DVFS_FREQUENCY_REDUCTION = 0.20  # 20% frequency reduction for memory-bound jobs
DVFS_POWER_SAVING = 0.12         # ~12% power saving from DVFS (cubic relationship)

# Memory-bound job threshold: if mem_power > cpu_power ratio exceeds this
MEMORY_BOUND_THRESHOLD = 0.5

# ─── ML Model Parameters ────────────────────────────────────────────────────
ML_TEST_SIZE = 0.2
ML_RANDOM_STATE = 42
ML_N_ESTIMATORS = 200
ML_MAX_DEPTH = 10
ML_GB_N_ESTIMATORS = 100   # GB is slower than RF/XGB; fewer trees suffice

# MLP (Multi-Layer Perceptron) parameters
MLP_HIDDEN_LAYERS = (64, 32)
MLP_MAX_ITER = 300
MLP_LEARNING_RATE_INIT = 0.001

# SVM parameters
SVM_C = 1.0
SVM_KERNEL = "rbf"
SVM_MAX_ITER = 5000
SVM_SUBSAMPLE_SIZE = 20000  # SVM is O(n²–n³); subsample for large datasets

# ─── CSV Export Paths ────────────────────────────────────────────────────────
CLASSIFIER_CSV_PATH = os.path.join(MODELS_DIR, "classifier_comparison.csv")
REGRESSOR_CSV_PATH = os.path.join(MODELS_DIR, "regressor_comparison.csv")

# ─── Carbon Footprint: Green Score Thresholds ───────────────────────────────
# gCO₂ per job thresholds for grading
GREEN_SCORE_THRESHOLDS = {
    "A": 0.5,    # ≤ 0.5g — Excellent
    "B": 1.0,    # ≤ 1.0g — Good
    "C": 2.0,    # ≤ 2.0g — Average
    "D": 5.0,    # ≤ 5.0g — Below Average
    "F": float("inf"),  # > 5.0g — Poor
}

# ─── Environmental Equivalences ─────────────────────────────────────────────
# 1 mature tree absorbs ~22 kg CO₂ per year (EPA estimate)
CO2_PER_TREE_PER_YEAR_KG = 22.0
# 1 km of car driving emits ~0.21 kg CO₂ (average petrol car)
CO2_PER_KM_DRIVING_KG = 0.21
# 1 smartphone charge ≈ 8.22g CO₂ (based on Indian grid)
CO2_PER_PHONE_CHARGE_G = 8.22
