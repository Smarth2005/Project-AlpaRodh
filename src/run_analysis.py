"""
AlpaRodh Pipeline — Main orchestrator.

Runs the complete AlpaRodh analysis pipeline:
1. Load and clean PM100 data
2. Compute energy baseline
3. Run all optimization strategies
4. Train AI models
5. Map to PARAM Yuva-II
6. Calculate carbon footprint
7. Generate multilingual reports
8. Export JSON for dashboard
"""

import os
import json
import sys
import io

# Fix Windows console encoding for Hindi/emoji characters
if sys.stdout.encoding != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
if sys.stderr.encoding != "utf-8":
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src import config
from src import data_loader
from src import baseline
from src import optimizer
from src import ai_predictor
from src import param_mapper
from src import carbon_footprint
from src import translator
import logging
logger = logging.getLogger(__name__)



def run_full_pipeline():
    """
    Execute the complete AlpaRodh analysis pipeline.
    
    Returns:
        dict: All results from every phase.
    """
    logger.info("=" * 60)
    logger.info("  अल्परोध (AlpaRodh) — Minimal Resistance")
    logger.info("  AI-Driven Variable Resistance Reduction")
    logger.info("  for India's Supercomputers")
    logger.info("=" * 60)

    results = {}

    # ── Phase 1: Data Loading ────────────────────────────────────────────
    logger.info("\n📂 Phase 1: Data Loading & Cleaning")
    logger.info("-" * 40)
    df = data_loader.load_and_clean()
    stats = data_loader.get_summary_stats(df)
    results["data_summary"] = stats

    # ── Phase 2: Baseline Energy ─────────────────────────────────────────
    logger.info("\n⚡ Phase 2: Establishing Energy Baseline")
    logger.info("-" * 40)
    df, total_baseline_kwh = baseline.calculate_energy(df)
    df, total_variable_kwh, static_floor = baseline.calculate_variable_energy(df)
    _, mismatch_count, _, over_alloc_count = baseline.detect_mismatches(df)
    
    baseline_summary = baseline.get_baseline_summary(
        df, total_baseline_kwh, total_variable_kwh, static_floor, mismatch_count
    )
    baseline_summary["over_alloc_count"] = over_alloc_count
    results["baseline"] = baseline_summary

    # ── Phase 3: Optimization ────────────────────────────────────────────
    logger.info("\n🔧 Phase 3: Applying Optimization Strategies")
    logger.info("-" * 40)
    opt_results = optimizer.apply_all_optimizations(df)
    df = opt_results.pop("dataframe")
    results["optimization"] = opt_results

    combined_savings = opt_results["combined"]["savings_kwh"]

    # ── Phase 4: AI Models ───────────────────────────────────────────────
    logger.info("\n🧠 Phase 4: Training AI Models")
    logger.info("-" * 40)
    ai_results = ai_predictor.run_all_models(df)
    results["ai_models"] = ai_results

    # ── Phase 5: PARAM Mapping ───────────────────────────────────────────
    logger.info("\n🇮🇳 Phase 5: PARAM Yuva-II Mapping")
    logger.info("-" * 40)
    hw_comparison = param_mapper.get_hardware_comparison()
    df, mapping_summary = param_mapper.map_to_param_yuva(df)
    projected = param_mapper.project_param_savings(combined_savings, mapping_summary)
    
    results["param_mapping"] = {
        "hardware_comparison": hw_comparison,
        "mapping_summary": mapping_summary,
        "projected_savings": projected,
    }

    # ── Phase 6: Carbon Footprint ────────────────────────────────────────
    logger.info("\n🌿 Phase 6: Carbon Footprint Analysis")
    logger.info("-" * 40)
    carbon_summary = carbon_footprint.get_carbon_summary(
        df, total_baseline_kwh, combined_savings, total_variable_kwh
    )
    results["carbon"] = carbon_summary

    # ── Phase 7: Multilingual Report ─────────────────────────────────────
    logger.info("\n🌐 Phase 7: Generating Multilingual Reports")
    logger.info("-" * 40)
    all_reports = translator.get_all_languages_report(results)
    results["translations"] = all_reports
    
    for lang, name in translator.LANGUAGE_NAMES.items():
        logger.info(f"   ✅ {name} report generated")

    # ── Export for Dashboard ──────────────────────────────────────────────
    logger.info("\n💾 Exporting results for dashboard...")
    export_for_dashboard(results)

    # ── Final Summary ────────────────────────────────────────────────────
    best_clf = ai_results['waste_classifier']
    best_reg = ai_results['energy_predictor']
    num_classifiers = len(ai_results.get('classifier_comparison', []))
    num_regressors = len(ai_results.get('regressor_comparison', []))

    logger.info("\n" + "=" * 60)
    logger.info("  🏆 AlpaRodh Pipeline Complete!")
    logger.info("=" * 60)
    logger.info(f"  📊 Jobs Analyzed:         {baseline_summary['total_jobs']:,}")
    logger.info(f"  ⚡ Baseline Energy:       {total_baseline_kwh:.2f} kWh")
    logger.info(f"  🔋 Variable Energy:       {total_variable_kwh:.2f} kWh")
    logger.info(f"  📉 Total Savings:         {combined_savings:.2f} kWh ({opt_results['combined']['savings_percent']:.2f}%)")
    logger.info(f"  🌿 CO₂ Prevented (India): {carbon_summary['savings']['co2_india_kg']:.2f} kg")
    logger.info(f"  📈 AlpaRodh Coefficient:  {carbon_summary['alpa_coefficient']:.4f} gCO₂/kWh")
    logger.info(f"  🤖 Best Classifier:       {best_clf['model_type']} (F1={best_clf['f1_score']:.4f})")
    logger.info(f"  🤖 Best Regressor:        {best_reg['model_type']} (R²={best_reg['r2_score']:.4f})")
    logger.info(f"  📊 Models Compared:       {num_classifiers} classifiers + {num_regressors} regressors")
    logger.info(f"  🌐 Languages:             EN, HI, MR")
    logger.info("=" * 60)

    return results


def export_for_dashboard(results):
    """
    Export results as JSON for the web dashboard.
    
    Filters out non-serializable objects and writes to dashboard/data.json.
    """
    dashboard_data = {
        "project": {
            "name": "अल्परोध (AlpaRodh)",
            "tagline": "AI-Driven Variable Resistance Reduction for India's Supercomputers",
            "version": "1.0.0",
        },
        "baseline": results.get("baseline", {}),
        "optimization": results.get("optimization", {}),
        "ai_models": {
            "waste_classifier": results.get("ai_models", {}).get("waste_classifier", {}),
            "energy_predictor": results.get("ai_models", {}).get("energy_predictor", {}),
            "classifier_comparison": results.get("ai_models", {}).get("classifier_comparison", []),
            "regressor_comparison": results.get("ai_models", {}).get("regressor_comparison", []),
        },
        "param_mapping": results.get("param_mapping", {}),
        "carbon": results.get("carbon", {}),
        "translations": results.get("translations", {}),
    }

    os.makedirs(os.path.dirname(config.DASHBOARD_DATA_PATH), exist_ok=True)
    
    with open(config.DASHBOARD_DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(dashboard_data, f, indent=2, ensure_ascii=False, default=str)

    logger.info(f"   ✅ Dashboard data exported to: {config.DASHBOARD_DATA_PATH}")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    results = run_full_pipeline()
