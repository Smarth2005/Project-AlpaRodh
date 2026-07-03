"""
AlpaRodh Carbon Footprint — CO₂ emission calculations and green scoring.

Converts energy savings into environmental impact metrics, including:
- CO₂ emissions (baseline vs optimized)
- AlpaRodh Coefficient (ηα) — Environmental Return on Optimization
- Per-job Green Scores (A-F grading)
- Real-world equivalences (trees, driving, phone charges)
- India vs Italy comparison
"""

import numpy as np
import pandas as pd

from . import config
import logging
logger = logging.getLogger(__name__)



def calculate_co2(energy_kwh, factor=None):
    """
    Calculate CO₂ emissions from energy consumption.
    
    Args:
        energy_kwh: Energy in kWh.
        factor: Emission factor in gCO₂/kWh. Defaults to Italy (PM100 location).
    
    Returns:
        float: CO₂ emissions in kg.
    """
    if factor is None:
        factor = config.CO2_FACTOR_ITALY
    return energy_kwh * factor / 1000  # g → kg


def calculate_alpa_coefficient(co2_saved_kg, variable_energy_kwh):
    """
    Calculate the AlpaRodh Coefficient (ηα).
    
    ηα = ΔCO₂ (g) / E_variable (kWh)
    
    This represents the "Environmental Return on Optimization" — how many
    grams of CO₂ are saved per kWh of variable energy optimized.
    A higher value means the optimization is highly effective at targeting
    high-emission workload segments.
    
    Args:
        co2_saved_kg: CO₂ saved in kg.
        variable_energy_kwh: Total variable energy in kWh.
    
    Returns:
        float: AlpaRodh Coefficient in gCO₂/kWh.
    """
    co2_saved_g = co2_saved_kg * 1000  # kg → g
    if variable_energy_kwh > 0:
        return co2_saved_g / variable_energy_kwh
    return 0.0


def carbon_per_job(df, total_co2_kg):
    """
    Calculate per-job carbon intensity.
    
    Args:
        df: DataFrame with job data.
        total_co2_kg: Total CO₂ in kg.
    
    Returns:
        float: Average carbon per job in grams.
    """
    total_co2_g = total_co2_kg * 1000
    if len(df) > 0:
        return total_co2_g / len(df)
    return 0.0


def green_score(carbon_per_job_g):
    """
    Assign a Green Score grade based on per-job carbon intensity.
    
    Grades:
        A (≤0.5g) — Excellent
        B (≤1.0g) — Good
        C (≤2.0g) — Average
        D (≤5.0g) — Below Average
        F (>5.0g) — Poor
    
    Args:
        carbon_per_job_g: Carbon intensity per job in grams.
    
    Returns:
        str: Grade letter (A-F).
    """
    for grade, threshold in config.GREEN_SCORE_THRESHOLDS.items():
        if carbon_per_job_g <= threshold:
            return grade
    return "F"


def green_score_distribution(df, co2_factor=None):
    """
    Calculate per-job energy and assign Green Scores to all jobs.
    
    Args:
        df: DataFrame with energy_wh column.
        co2_factor: Emission factor. Defaults to Italy.
    
    Returns:
        dict: Distribution of grades {A: count, B: count, ...}.
    """
    if co2_factor is None:
        co2_factor = config.CO2_FACTOR_ITALY

    # Per-job CO2 in grams
    job_co2_g = df["energy_wh"] / 1000 * co2_factor  # Wh → kWh → gCO2

    grades = job_co2_g.apply(green_score)
    distribution = grades.value_counts().to_dict()

    # Ensure all grades present
    for grade in config.GREEN_SCORE_THRESHOLDS:
        if grade not in distribution:
            distribution[grade] = 0

    return distribution


def india_vs_italy_comparison(energy_kwh, savings_kwh):
    """
    Compare emissions under Italian vs Indian grid factors.
    
    This highlights why reducing HPC energy waste in India is even more
    critical — India's grid is ~3x more carbon-intensive than Italy's.
    
    Args:
        energy_kwh: Total energy consumption in kWh.
        savings_kwh: Energy saved in kWh.
    
    Returns:
        dict: Comparison data for both countries.
    """
    return {
        "italy": {
            "co2_factor": config.CO2_FACTOR_ITALY,
            "baseline_co2_kg": round(calculate_co2(energy_kwh, config.CO2_FACTOR_ITALY), 2),
            "saved_co2_kg": round(calculate_co2(savings_kwh, config.CO2_FACTOR_ITALY), 2),
        },
        "india": {
            "co2_factor": config.CO2_FACTOR_INDIA,
            "baseline_co2_kg": round(calculate_co2(energy_kwh, config.CO2_FACTOR_INDIA), 2),
            "saved_co2_kg": round(calculate_co2(savings_kwh, config.CO2_FACTOR_INDIA), 2),
        },
        "india_multiplier": round(config.CO2_FACTOR_INDIA / config.CO2_FACTOR_ITALY, 2),
    }


def real_world_equivalences(co2_saved_kg):
    """
    Convert CO₂ savings into relatable real-world equivalences.
    
    Makes the environmental impact tangible for non-technical audiences.
    
    Args:
        co2_saved_kg: CO₂ saved in kg.
    
    Returns:
        dict: Equivalences in trees, driving km, and phone charges.
    """
    trees = co2_saved_kg / config.CO2_PER_TREE_PER_YEAR_KG
    driving_km = co2_saved_kg / config.CO2_PER_KM_DRIVING_KG
    phone_charges = (co2_saved_kg * 1000) / config.CO2_PER_PHONE_CHARGE_G

    return {
        "trees_year": round(trees, 2),
        "driving_km_avoided": round(driving_km, 1),
        "phone_charges_equivalent": int(phone_charges),
    }


def get_carbon_summary(df, baseline_kwh, savings_kwh, variable_kwh):
    """
    Generate a complete carbon footprint report.
    
    Args:
        df: Full dataframe.
        baseline_kwh: Total baseline energy.
        savings_kwh: Total energy saved by AlpaRodh.
        variable_kwh: Variable energy component.
    
    Returns:
        dict: Comprehensive carbon report.
    """
    # Italy (PM100 baseline)
    co2_baseline_italy = calculate_co2(baseline_kwh, config.CO2_FACTOR_ITALY)
    co2_saved_italy = calculate_co2(savings_kwh, config.CO2_FACTOR_ITALY)
    
    # India (PARAM projection)
    co2_baseline_india = calculate_co2(baseline_kwh, config.CO2_FACTOR_INDIA)
    co2_saved_india = calculate_co2(savings_kwh, config.CO2_FACTOR_INDIA)

    # AlpaRodh Coefficient
    alpa_coeff = calculate_alpa_coefficient(co2_saved_italy, variable_kwh)

    # Per-job metrics
    cpj_baseline = carbon_per_job(df, co2_baseline_italy)
    cpj_optimized = carbon_per_job(df, co2_baseline_italy - co2_saved_italy)
    grade_baseline = green_score(cpj_baseline)
    grade_optimized = green_score(cpj_optimized)

    # Grade distribution
    grade_dist = green_score_distribution(df, config.CO2_FACTOR_ITALY)

    # Comparison
    comparison = india_vs_italy_comparison(baseline_kwh, savings_kwh)

    # Real-world equivalences (using India factor for impact)
    equivalences = real_world_equivalences(co2_saved_india)

    summary = {
        "baseline": {
            "co2_italy_kg": round(co2_baseline_italy, 2),
            "co2_india_kg": round(co2_baseline_india, 2),
        },
        "savings": {
            "co2_italy_kg": round(co2_saved_italy, 2),
            "co2_india_kg": round(co2_saved_india, 2),
        },
        "alpa_coefficient": round(alpa_coeff, 4),
        "alpa_coefficient_unit": "gCO₂/kWh",
        "per_job": {
            "baseline_carbon_g": round(cpj_baseline, 4),
            "optimized_carbon_g": round(cpj_optimized, 4),
            "baseline_grade": grade_baseline,
            "optimized_grade": grade_optimized,
        },
        "grade_distribution": grade_dist,
        "india_vs_italy": comparison,
        "equivalences": equivalences,
    }

    logger.info(f"\n🌍 === CARBON FOOTPRINT REPORT ===")
    logger.info(f"   CO₂ Baseline (Italy):  {co2_baseline_italy:.2f} kg")
    logger.info(f"   CO₂ Saved (Italy):     {co2_saved_italy:.2f} kg")
    logger.info(f"   CO₂ Saved (India):     {co2_saved_india:.2f} kg")
    logger.info(f"   AlpaRodh Coefficient:  {alpa_coeff:.4f} gCO₂/kWh")
    logger.info(f"   Green Grade: {grade_baseline} → {grade_optimized}")
    logger.info(f"   🌳 Equivalent to {equivalences['trees_year']:.1f} trees/year")
    logger.info(f"   🚗 {equivalences['driving_km_avoided']:.0f} km of driving avoided")
    logger.info(f"   📱 {equivalences['phone_charges_equivalent']} phone charges saved")

    return summary
