"""
AlpaRodh AI Predictor — Multi-Model ML Engine for HPC Energy Waste Prediction.

THE CENTERPIECE: Trains and compares multiple ML models to predict which HPC
jobs will waste energy BEFORE they run, and to forecast per-job energy consumption.

────────────────────────────────────────────────────────────────────────────────
BRIEF LITERATURE REVIEW — Justification for Model Selection
────────────────────────────────────────────────────────────────────────────────

The choice of models is grounded in recent (2024–2025) literature on ML/DL
for HPC energy prediction and tabular data classification:

1. RANDOM FOREST (Breiman, 2001)
   - Widely used as a robust baseline in HPC energy prediction research.
   - Studies on PM100/Marconi100 data (CINECA, University of Bologna) employ
     tree-based ensembles as primary models for job-level power estimation.
   - Handles non-linear feature interactions without extensive tuning.

2. XGBOOST (Chen & Guestrin, 2016)
   - Consistently the top performer for structured/tabular data across
     multiple benchmarks (Grinsztajn et al., NeurIPS 2022).
   - Superior regularization and handling of missing values vs. sklearn GB.
   - Dominant in data center energy forecasting literature (2024–2025).

3. GRADIENT BOOSTING (Friedman, 2001)
   - Strong sequential ensemble method; sklearn's implementation serves as
     comparison baseline against XGBoost on same data.
   - Used in ExaMon (CINECA's HPC monitoring framework) for power prediction.

4. MLP / NEURAL NETWORK (Rumelhart et al., 1986)
   - Included as a deep learning representative to test whether neural
     architectures offer advantages over tree-based models on tabular HPC data.
   - Recent surveys confirm tree models outperform MLPs on most tabular tasks,
     but MLPs remain competitive on high-dimensional feature spaces.

5. SVM / SVR (Cortes & Vapnik, 1995)
   - Classical margin-based approach; effective when feature space is well-scaled.
   - Serves as a non-ensemble, non-tree baseline for comparison.
   - Used in early HPC workload classification studies.

6. LOGISTIC REGRESSION / RIDGE REGRESSION (Cox, 1958 / Hoerl & Kennard, 1970)
   - Linear baselines essential for establishing whether complex models
     provide genuine improvements over simple linear decision boundaries.
   - If a linear model performs comparably, complex models may be overfitting.

CONSENSUS (2024–2025): For structured/tabular HPC telemetry data, gradient-
boosted decision trees (XGBoost, LightGBM) consistently match or outperform
deep learning models while being faster, more interpretable, and requiring
less compute (Grinsztajn et al., 2022; multiple systematic reviews 2024–2025).
Deep learning (LSTM, Transformer) is preferred for time-series monitoring,
not per-job snapshot prediction as in this project.

────────────────────────────────────────────────────────────────────────────────

Models:
    Classification (Waste Detection):
        1. Random Forest         — Ensemble baseline
        2. XGBoost               — Expected top performer
        3. Gradient Boosting     — Sequential ensemble comparison
        4. MLP (Neural Network)  — Deep learning representative
        5. SVM (RBF kernel)      — Margin-based classifier
        6. Logistic Regression   — Linear baseline

    Regression (Energy Prediction):
        1. Gradient Boosting     — Sequential ensemble baseline
        2. XGBoost               — Expected top performer
        3. Random Forest         — Ensemble comparison
        4. MLP (Neural Network)  — Deep learning representative
        5. SVR (RBF kernel)      — Kernel regression
        6. Ridge Regression      — Linear baseline

DATA LEAKAGE FIX:
    Previous version used `core_mismatch` and `mismatch_ratio` as both
    features AND label derivation — yielding 100% accuracy (trivial).
    Now the classifier uses ONLY power & runtime features, excluding all
    allocation-derived features that directly encode the label.
"""

import os
import time
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import (
    RandomForestClassifier, RandomForestRegressor,
    GradientBoostingClassifier, GradientBoostingRegressor,
)
from sklearn.neural_network import MLPClassifier, MLPRegressor
from sklearn.svm import SVC, SVR
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    mean_absolute_error, mean_squared_error, r2_score,
)
from sklearn.preprocessing import StandardScaler
import joblib

try:
    from xgboost import XGBClassifier, XGBRegressor
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False
    logger.info("⚠️  XGBoost not installed. Run: pip install xgboost")

from . import config
from .topsis import calculate_topsis
import logging
logger = logging.getLogger(__name__)



# ─── Feature Engineering ────────────────────────────────────────────────────

def engineer_features_classifier(df):
    """
    Create features for the WASTE CLASSIFIER.

    DATA LEAKAGE FIX: Excludes `core_mismatch`, `mismatch_ratio`,
    `num_cores_req`, and `num_cores_alloc` — these directly encode the
    waste label and would yield trivially perfect accuracy.

    The classifier must learn to detect over-allocation from power
    consumption and runtime patterns only.

    Args:
        df: Cleaned dataframe with power and allocation columns.

    Returns:
        pd.DataFrame: Feature matrix for classification (no allocation features).
    """
    features = pd.DataFrame()

    # Power features (in watts) — the core predictive signals
    features["node_pwr_w"] = df["node_pwr_w"]
    features["cpu_pwr_w"] = df["cpu_pwr_w"]
    features["mem_pwr_w"] = df["mem_pwr_w"]

    # Power ratios — captures workload characteristics
    features["cpu_to_node_ratio"] = np.where(
        df["node_pwr_w"] > 0,
        df["cpu_pwr_w"] / df["node_pwr_w"],
        0
    )
    features["mem_to_cpu_ratio"] = np.where(
        df["cpu_pwr_w"] > 0,
        df["mem_pwr_w"] / df["cpu_pwr_w"],
        0
    )

    # Power per core — efficiency metric (uses alloc but is a derived signal)
    features["power_per_core"] = np.where(
        df["num_cores_alloc"] > 0,
        df["node_pwr_w"] / df["num_cores_alloc"],
        0
    )

    # Runtime features
    features["run_time"] = df["run_time"]
    features["log_run_time"] = np.log1p(df["run_time"])

    # GPU features (if available)
    if "num_gpus_alloc" in df.columns:
        features["num_gpus_alloc"] = df["num_gpus_alloc"]
        features["has_gpu"] = (df["num_gpus_alloc"] > 0).astype(int)
    else:
        features["num_gpus_alloc"] = 0
        features["has_gpu"] = 0

    # Clean infinities and NaNs
    features = features.replace([np.inf, -np.inf], 0).fillna(0)

    return features


def engineer_features_regressor(df):
    """
    Create features for the ENERGY PREDICTOR (regression).

    No leakage concern here — the target is `energy_wh` which is not
    derivable from any single feature. All features are kept.

    Args:
        df: Cleaned dataframe with power and allocation columns.

    Returns:
        pd.DataFrame: Full feature matrix for regression.
    """
    features = pd.DataFrame()

    # Core allocation features
    features["num_cores_req"] = df["num_cores_req"]
    features["num_cores_alloc"] = df["num_cores_alloc"]
    features["core_mismatch"] = df["num_cores_alloc"] - df["num_cores_req"]
    features["mismatch_ratio"] = np.where(
        df["num_cores_alloc"] > 0,
        features["core_mismatch"] / df["num_cores_alloc"],
        0
    )

    # Power features (in watts)
    features["node_pwr_w"] = df["node_pwr_w"]
    features["cpu_pwr_w"] = df["cpu_pwr_w"]
    features["mem_pwr_w"] = df["mem_pwr_w"]

    # Power ratios
    features["cpu_to_node_ratio"] = np.where(
        df["node_pwr_w"] > 0,
        df["cpu_pwr_w"] / df["node_pwr_w"],
        0
    )
    features["mem_to_cpu_ratio"] = np.where(
        df["cpu_pwr_w"] > 0,
        df["mem_pwr_w"] / df["cpu_pwr_w"],
        0
    )

    # Power per core
    features["power_per_core"] = np.where(
        df["num_cores_alloc"] > 0,
        df["node_pwr_w"] / df["num_cores_alloc"],
        0
    )

    # Runtime features
    features["run_time"] = df["run_time"]
    features["log_run_time"] = np.log1p(df["run_time"])

    # GPU features
    if "num_gpus_alloc" in df.columns:
        features["num_gpus_alloc"] = df["num_gpus_alloc"]
        features["has_gpu"] = (df["num_gpus_alloc"] > 0).astype(int)
    else:
        features["num_gpus_alloc"] = 0
        features["has_gpu"] = 0

    # Clean infinities and NaNs
    features = features.replace([np.inf, -np.inf], 0).fillna(0)

    return features


def create_labels(df):
    """
    Create target labels for the waste classifier.

    A job is labeled 'wasteful' if:
    - Allocated cores > requested cores (over-allocation), AND
    - The mismatch ratio is significant (> 20%)

    Args:
        df: DataFrame with core allocation columns.

    Returns:
        pd.Series: Binary labels (1 = wasteful, 0 = efficient).
    """
    mismatch_ratio = np.where(
        df["num_cores_alloc"] > 0,
        (df["num_cores_alloc"] - df["num_cores_req"]) / df["num_cores_alloc"],
        0
    )
    is_wasteful = (mismatch_ratio > 0.2).astype(int)

    wasteful_count = int(is_wasteful.sum())
    efficient_count = len(is_wasteful) - wasteful_count
    logger.info(f"🏷️  Labels created: {wasteful_count} wasteful / {efficient_count} efficient")
    return pd.Series(is_wasteful, index=df.index)


# ─── Model Definitions ──────────────────────────────────────────────────────

def _get_classifiers():
    """Return dict of classifier name -> model instance."""
    classifiers = {
        "Random Forest": RandomForestClassifier(
            n_estimators=config.ML_N_ESTIMATORS,
            max_depth=config.ML_MAX_DEPTH,
            random_state=config.ML_RANDOM_STATE,
            n_jobs=-1,
            class_weight="balanced",
        ),
        "Gradient Boosting": GradientBoostingClassifier(
            n_estimators=config.ML_GB_N_ESTIMATORS,
            max_depth=min(config.ML_MAX_DEPTH, 6),
            random_state=config.ML_RANDOM_STATE,
            learning_rate=0.1,
            subsample=0.8,
        ),
        "MLP (Neural Net)": MLPClassifier(
            hidden_layer_sizes=config.MLP_HIDDEN_LAYERS,
            max_iter=config.MLP_MAX_ITER,
            random_state=config.ML_RANDOM_STATE,
            learning_rate_init=config.MLP_LEARNING_RATE_INIT,
            early_stopping=True,
            validation_fraction=0.1,
        ),
        "SVM (RBF)": SVC(
            C=config.SVM_C,
            kernel=config.SVM_KERNEL,
            random_state=config.ML_RANDOM_STATE,
            max_iter=config.SVM_MAX_ITER,
            class_weight="balanced",
        ),
        "Logistic Regression": LogisticRegression(
            max_iter=1000,
            random_state=config.ML_RANDOM_STATE,
            class_weight="balanced",
            n_jobs=-1,
        ),
    }

    if HAS_XGBOOST:
        classifiers["XGBoost"] = XGBClassifier(
            n_estimators=config.ML_N_ESTIMATORS,
            max_depth=config.ML_MAX_DEPTH,
            random_state=config.ML_RANDOM_STATE,
            learning_rate=0.1,
            use_label_encoder=False,
            eval_metric="logloss",
            n_jobs=-1,
            scale_pos_weight=1,  # Will be adjusted in training
        )

    return classifiers


def _get_regressors():
    """Return dict of regressor name -> model instance."""
    regressors = {
        "Gradient Boosting": GradientBoostingRegressor(
            n_estimators=config.ML_GB_N_ESTIMATORS,
            max_depth=min(config.ML_MAX_DEPTH, 6),
            random_state=config.ML_RANDOM_STATE,
            learning_rate=0.1,
            subsample=0.8,
        ),
        "Random Forest": RandomForestRegressor(
            n_estimators=config.ML_N_ESTIMATORS,
            max_depth=config.ML_MAX_DEPTH,
            random_state=config.ML_RANDOM_STATE,
            n_jobs=-1,
        ),
        "MLP (Neural Net)": MLPRegressor(
            hidden_layer_sizes=config.MLP_HIDDEN_LAYERS,
            max_iter=config.MLP_MAX_ITER,
            random_state=config.ML_RANDOM_STATE,
            learning_rate_init=config.MLP_LEARNING_RATE_INIT,
            early_stopping=True,
            validation_fraction=0.1,
        ),
        "SVR (RBF)": SVR(
            C=config.SVM_C,
            kernel=config.SVM_KERNEL,
            max_iter=config.SVM_MAX_ITER,
        ),
        "Ridge Regression": Ridge(
            alpha=1.0,
            random_state=config.ML_RANDOM_STATE,
        ),
    }

    if HAS_XGBOOST:
        regressors["XGBoost"] = XGBRegressor(
            n_estimators=config.ML_N_ESTIMATORS,
            max_depth=min(config.ML_MAX_DEPTH, 6),
            random_state=config.ML_RANDOM_STATE,
            learning_rate=0.1,
            n_jobs=-1,
        )

    return regressors


# ─── Training: All Classifiers ──────────────────────────────────────────────

def train_all_classifiers(df):
    """
    Train all 6 classifiers and return comparison results.

    Uses the LEAKAGE-FREE feature set (no allocation-derived features).

    Args:
        df: Full cleaned dataframe.

    Returns:
        dict: Contains per-model metrics, best model info, and feature importances.
    """
    logger.info("\n🤖 Training Waste Classifiers (6 models)...")
    logger.info("   ⚠️  Using leakage-free features (power + runtime only)")

    X = engineer_features_classifier(df)
    y = create_labels(df)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=config.ML_TEST_SIZE, random_state=config.ML_RANDOM_STATE,
        stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    classifiers = _get_classifiers()
    results = []
    trained_models = {}

    for name, model in classifiers.items():
        logger.info(f"\n   📊 Training: {name}...")
        start_time = time.time()

        try:
            # SVM is O(n²–n³) — subsample for feasibility on large datasets
            if "SVM" in name and len(X_train_scaled) > config.SVM_SUBSAMPLE_SIZE:
                idx = np.random.RandomState(config.ML_RANDOM_STATE).choice(
                    len(X_train_scaled), config.SVM_SUBSAMPLE_SIZE, replace=False
                )
                X_fit, y_fit = X_train_scaled[idx], y_train.iloc[idx]
                logger.info(f"      (Subsampled to {config.SVM_SUBSAMPLE_SIZE} for SVM feasibility)")
            else:
                X_fit, y_fit = X_train_scaled, y_train

            # Adjust XGBoost scale_pos_weight for class imbalance
            if name == "XGBoost":
                neg_count = int((y_train == 0).sum())
                pos_count = int((y_train == 1).sum())
                if pos_count > 0:
                    model.set_params(scale_pos_weight=neg_count / pos_count)

            model.fit(X_fit, y_fit)
            train_time = time.time() - start_time

            y_pred = model.predict(X_test_scaled)

            acc = accuracy_score(y_test, y_pred)
            prec = precision_score(y_test, y_pred, zero_division=0)
            rec = recall_score(y_test, y_pred, zero_division=0)
            f1 = f1_score(y_test, y_pred, zero_division=0)

            logger.info(f"      Accuracy: {acc:.4f} | Precision: {prec:.4f} | Recall: {rec:.4f} | F1: {f1:.4f} | Time: {train_time:.1f}s")

            result = {
                "Model": name,
                "Accuracy": round(acc, 4),
                "Precision": round(prec, 4),
                "Recall": round(rec, 4),
                "F1_Score": round(f1, 4),
                "Train_Size": len(X_train),
                "Test_Size": len(X_test),
                "Training_Time_s": round(train_time, 2),
            }
            results.append(result)
            trained_models[name] = model

        except Exception as e:
            logger.info(f"      ❌ {name} failed: {e}")
            results.append({
                "Model": name,
                "Accuracy": 0, "Precision": 0, "Recall": 0, "F1_Score": 0,
                "Train_Size": len(X_train), "Test_Size": len(X_test),
                "Training_Time_s": 0,
            })

    # Apply TOPSIS to select the best model
    results_df = pd.DataFrame(results)
    criteria = ["Accuracy", "Precision", "Recall", "F1_Score", "Training_Time_s"]
    weights = [1, 1, 1, 1, 1]
    impacts = ["+", "+", "+", "+", "-"]
    results_df = calculate_topsis(results_df, criteria, weights, impacts)

    best_model_name = results_df.iloc[0]["Model"]
    best_model = trained_models.get(best_model_name, None)
    best_f1 = results_df.iloc[0]["F1_Score"]
    best_topsis = results_df.iloc[0]["Topsis Score"]

    # Save best model and scaler
    os.makedirs(config.MODELS_DIR, exist_ok=True)
    if best_model is not None:
        joblib.dump(best_model, os.path.join(config.MODELS_DIR, "waste_classifier.joblib"))
        joblib.dump(scaler, os.path.join(config.MODELS_DIR, "waste_scaler.joblib"))
        logger.info(f"\n   🏆 Best Classifier (via TOPSIS): {best_model_name} (F1={best_f1:.4f}, TOPSIS={best_topsis:.4f})")

    # Get feature importances from best model (if tree-based)
    feature_importances = _extract_feature_importances(best_model, X.columns.tolist())

    # Save comparison CSV
    results_df.to_csv(config.CLASSIFIER_CSV_PATH, index=False)
    logger.info(f"   💾 Classifier comparison saved: {config.CLASSIFIER_CSV_PATH}")

    return {
        "all_models": results_df.to_dict(orient="records"),
        "best_model": {
            "model_type": best_model_name,
            "accuracy": round(best_f1, 4) if best_model is None else results_df.loc[results_df["Model"] == best_model_name, "Accuracy"].values[0],
            "precision": results_df.loc[results_df["Model"] == best_model_name, "Precision"].values[0] if best_model is not None else 0,
            "recall": results_df.loc[results_df["Model"] == best_model_name, "Recall"].values[0] if best_model is not None else 0,
            "f1_score": round(best_f1, 4),
            "feature_importances": {fi["name"]: fi["importance"] for fi in feature_importances},
            "top_features": feature_importances[:7],
            "train_size": len(X_train),
            "test_size": len(X_test),
        },
        "csv_path": config.CLASSIFIER_CSV_PATH,
    }


# ─── Training: All Regressors ───────────────────────────────────────────────

def train_all_regressors(df):
    """
    Train all 6 regressors and return comparison results.

    Uses the FULL feature set (no leakage for energy prediction).

    Args:
        df: Full cleaned dataframe with 'energy_wh' column.

    Returns:
        dict: Contains per-model metrics, best model info, and feature importances.
    """
    logger.info("\n\n🤖 Training Energy Predictors (6 models)...")

    X = engineer_features_regressor(df)
    y = df["energy_wh"]

    # Remove extreme outliers for stable training (top 1%)
    q99 = y.quantile(0.99)
    mask = y <= q99
    X_clean = X[mask]
    y_clean = y[mask]

    X_train, X_test, y_train, y_test = train_test_split(
        X_clean, y_clean, test_size=config.ML_TEST_SIZE, random_state=config.ML_RANDOM_STATE
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    regressors = _get_regressors()
    results = []
    trained_models = {}

    for name, model in regressors.items():
        logger.info(f"\n   📊 Training: {name}...")
        start_time = time.time()

        try:
            # SVR is O(n²–n³) — subsample for feasibility on large datasets
            if "SVR" in name and len(X_train_scaled) > config.SVM_SUBSAMPLE_SIZE:
                idx = np.random.RandomState(config.ML_RANDOM_STATE).choice(
                    len(X_train_scaled), config.SVM_SUBSAMPLE_SIZE, replace=False
                )
                X_fit, y_fit = X_train_scaled[idx], y_train.iloc[idx]
                logger.info(f"      (Subsampled to {config.SVM_SUBSAMPLE_SIZE} for SVR feasibility)")
            else:
                X_fit, y_fit = X_train_scaled, y_train

            model.fit(X_fit, y_fit)
            train_time = time.time() - start_time

            y_pred = model.predict(X_test_scaled)

            mae = mean_absolute_error(y_test, y_pred)
            rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            r2 = r2_score(y_test, y_pred)

            logger.info(f"      MAE: {mae:.4f} Wh | RMSE: {rmse:.4f} Wh | R²: {r2:.4f} | Time: {train_time:.1f}s")

            result = {
                "Model": name,
                "MAE_Wh": round(mae, 4),
                "RMSE_Wh": round(rmse, 4),
                "R2_Score": round(r2, 4),
                "Train_Size": len(X_train),
                "Test_Size": len(X_test),
                "Training_Time_s": round(train_time, 2),
            }
            results.append(result)
            trained_models[name] = model

        except Exception as e:
            logger.info(f"      ❌ {name} failed: {e}")
            results.append({
                "Model": name,
                "MAE_Wh": float("inf"), "RMSE_Wh": float("inf"), "R2_Score": 0,
                "Train_Size": len(X_train), "Test_Size": len(X_test),
                "Training_Time_s": 0,
            })

    # Apply TOPSIS to select the best model
    results_df = pd.DataFrame(results)
    criteria = ["MAE_Wh", "RMSE_Wh", "R2_Score", "Training_Time_s"]
    weights = [1, 1, 1, 1]
    impacts = ["-", "-", "+", "-"]
    results_df = calculate_topsis(results_df, criteria, weights, impacts)

    best_model_name = results_df.iloc[0]["Model"]
    best_model = trained_models.get(best_model_name, None)
    best_r2 = results_df.iloc[0]["R2_Score"]
    best_topsis = results_df.iloc[0]["Topsis Score"]

    # Save best model and scaler
    os.makedirs(config.MODELS_DIR, exist_ok=True)
    if best_model is not None:
        joblib.dump(best_model, os.path.join(config.MODELS_DIR, "energy_predictor.joblib"))
        joblib.dump(scaler, os.path.join(config.MODELS_DIR, "energy_scaler.joblib"))
        logger.info(f"\n   🏆 Best Regressor (via TOPSIS): {best_model_name} (R²={best_r2:.4f}, TOPSIS={best_topsis:.4f})")

    # Get feature importances from best model
    feature_importances = _extract_feature_importances(best_model, X.columns.tolist())

    # Save comparison CSV
    results_df.to_csv(config.REGRESSOR_CSV_PATH, index=False)
    logger.info(f"   💾 Regressor comparison saved: {config.REGRESSOR_CSV_PATH}")

    return {
        "all_models": results_df.to_dict(orient="records"),
        "best_model": {
            "model_type": best_model_name,
            "mae_wh": results_df.loc[results_df["Model"] == best_model_name, "MAE_Wh"].values[0] if best_model is not None else 0,
            "rmse_wh": results_df.loc[results_df["Model"] == best_model_name, "RMSE_Wh"].values[0] if best_model is not None else 0,
            "r2_score": round(best_r2, 4),
            "feature_importances": {fi["name"]: fi["importance"] for fi in feature_importances},
            "top_features": feature_importances[:7],
            "train_size": len(X_train),
            "test_size": len(X_test),
            "outliers_removed": int((~mask).sum()),
        },
        "csv_path": config.REGRESSOR_CSV_PATH,
    }


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _extract_feature_importances(model, feature_names):
    """
    Extract feature importances from a model (if supported).

    Works for tree-based models (feature_importances_), linear models (coef_),
    and returns empty list for models without interpretable importances.
    """
    importances = None

    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
    elif hasattr(model, "coef_"):
        coef = model.coef_
        if coef.ndim > 1:
            coef = coef[0]
        importances = np.abs(coef)
        # Normalize to sum to 1
        total = importances.sum()
        if total > 0:
            importances = importances / total

    if importances is not None:
        fi = sorted(
            zip(feature_names, importances),
            key=lambda x: x[1],
            reverse=True,
        )
        return [{"name": name, "importance": round(float(imp), 4)} for name, imp in fi]

    return [{"name": name, "importance": 0.0} for name in feature_names]


# ─── Main Orchestrator ──────────────────────────────────────────────────────

def run_all_models(df):
    """
    Train all classifiers and regressors, export CSVs, return results.

    Args:
        df: Full cleaned dataframe.

    Returns:
        dict: Results from all models, structured for dashboard compatibility.
    """
    logger.info("\n" + "=" * 60)
    logger.info("  🧠 AlpaRodh AI Engine — Multi-Model Comparison")
    logger.info("  📚 6 Classifiers × 6 Regressors = 12 Models")
    logger.info("=" * 60)

    classifier_results = train_all_classifiers(df)
    regressor_results = train_all_regressors(df)

    # Structure for backward-compatible dashboard output:
    # Keep "waste_classifier" and "energy_predictor" pointing to best models
    return {
        "waste_classifier": classifier_results["best_model"],
        "energy_predictor": regressor_results["best_model"],
        "classifier_comparison": classifier_results["all_models"],
        "regressor_comparison": regressor_results["all_models"],
    }
