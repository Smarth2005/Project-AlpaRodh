# Literature Review — Model Selection Justification for AlpaRodh

## Context

AlpaRodh uses machine learning to predict energy waste in High-Performance Computing (HPC) jobs using the PM100 (Marconi100) telemetry dataset from CINECA, Italy. The dataset contains ~231K job records with tabular features: power consumption (node, CPU, memory), core allocation, runtime, and GPU usage.

This review justifies the selection of 6 classification and 6 regression models for comparative analysis.

---

## 1. Nature of the Data: Tabular, Not Sequential

The PM100 dataset is a **static tabular dataset** — each row is an independent job snapshot with numeric features. This is fundamentally different from time-series data (e.g., real-time power monitoring), which has temporal dependencies.

**Key implication**: Models designed for sequential data (LSTM, GRU, Transformer) do not provide structural advantages here. Tree-based ensembles and classical ML models are the appropriate methodological choice (Grinsztajn et al., 2022).

---

## 2. Model Justification

### 2.1 Random Forest (Breiman, 2001)

- **Type**: Bagging ensemble of decision trees
- **Why chosen**: Robust baseline for tabular data; handles non-linear interactions without extensive tuning. Widely used in HPC energy research — CINECA/University of Bologna studies on PM100 data use tree-based models as primary approaches for job-level power estimation.
- **Strengths**: Low variance, interpretable via feature importances, fast parallel training.

### 2.2 XGBoost (Chen & Guestrin, 2016)

- **Type**: Gradient-boosted decision trees with regularization
- **Why chosen**: Consistently the top performer for structured/tabular data across benchmarks. The NeurIPS 2022 study by Grinsztajn et al. confirms tree-based models outperform deep learning on tabular tasks. XGBoost dominates in data center energy forecasting literature (2024–2025).
- **Strengths**: Superior regularization (L1/L2), handles missing values natively, optimized for speed.

### 2.3 Gradient Boosting (Friedman, 2001)

- **Type**: Sequential boosting ensemble
- **Why chosen**: Comparison baseline against XGBoost to isolate the effect of XGBoost's optimizations. Used in ExaMon, CINECA's HPC monitoring framework.
- **Strengths**: Effective sequential learning; widely understood in the research community.

### 2.4 MLP — Multi-Layer Perceptron (Rumelhart et al., 1986)

- **Type**: Feedforward neural network (deep learning representative)
- **Why chosen**: Included to test whether neural architectures offer advantages over tree-based models on tabular HPC data. Recent systematic reviews (2024) confirm that MLPs are competitive but rarely outperform trees on structured data with ≤50 features.
- **Architecture used**: 3 hidden layers (128 → 64 → 32), ReLU activation, Adam optimizer.
- **Strengths**: Can capture complex non-linear boundaries; serves as DL baseline.

### 2.5 SVM / SVR (Cortes & Vapnik, 1995)

- **Type**: Margin-based classifier/regressor with RBF kernel
- **Why chosen**: Classical non-ensemble, non-tree model for comparison. Used in early HPC workload classification studies. Effective when feature space is well-scaled (which we ensure via StandardScaler).
- **Strengths**: Strong theoretical foundations; effective in high-dimensional, well-scaled spaces.

### 2.6 Logistic Regression / Ridge Regression (Cox, 1958; Hoerl & Kennard, 1970)

- **Type**: Linear models
- **Why chosen**: Essential linear baselines. If a linear model performs comparably to complex ensembles, it suggests the task does not require non-linear modeling (and complex models may be overfitting). Ridge regularization prevents multicollinearity issues.
- **Strengths**: Fastest training, fully interpretable coefficients, strong baselines.

---

## 3. Literature Consensus (2024–2025)

| Finding | Source |
|---------|--------|
| Tree-based models outperform DL on tabular data | Grinsztajn et al., NeurIPS 2022 (highly cited through 2025) |
| XGBoost/LightGBM are top performers for tabular HPC data | Multiple systematic reviews, 2024–2025 |
| Data quality matters more than model complexity | Systematic reviews on energy forecasting, 2024 |
| LSTM/Transformer suited for time-series, not tabular snapshots | CNN-LSTM-Attention literature, 2024 |
| Hybrid models (CNN-LSTM-Attention) for temporal forecasting only | AmericasPG, MDPI journals, 2024 |
| ExaMon (CINECA) uses tree-based models for HPC monitoring | E4Company / CINECA publications |

---

## 4. TOPSIS-Ready Model Comparison

All model results are exported to CSV files (`classifier_comparison.csv` and `regressor_comparison.csv`) with standardized columns ready for TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution) multi-criteria decision analysis:

- **Classification criteria**: Accuracy, Precision, Recall, F1 Score, Training Time
- **Regression criteria**: MAE, RMSE, R² Score, Training Time

TOPSIS allows assigning weights to each criterion (e.g., F1 Score weighted higher than training time) and ranking models objectively.

---

## References

1. Breiman, L. (2001). Random Forests. *Machine Learning*, 45(1), 5–32.
2. Chen, T., & Guestrin, C. (2016). XGBoost: A Scalable Tree Boosting System. *KDD '16*.
3. Friedman, J. H. (2001). Greedy Function Approximation: A Gradient Boosting Machine. *Annals of Statistics*.
4. Rumelhart, D. E., Hinton, G. E., & Williams, R. J. (1986). Learning representations by back-propagating errors. *Nature*, 323, 533–536.
5. Cortes, C., & Vapnik, V. (1995). Support-vector networks. *Machine Learning*, 20(3), 273–297.
6. Cox, D. R. (1958). The regression analysis of binary sequences. *JRSS-B*.
7. Hoerl, A. E., & Kennard, R. W. (1970). Ridge regression. *Technometrics*, 12(1), 55–67.
8. Grinsztajn, L., Oyallon, E., & Varoquaux, G. (2022). Why do tree-based models still outperform deep learning on typical tabular data? *NeurIPS 2022*.
9. Bartolini, A., et al. PM100 Dataset — Job-level telemetry from Marconi100. *Zenodo / CINECA*.
10. ExaMon Project — CINECA HPC Monitoring Framework. *E4 Company / CINECA*.
