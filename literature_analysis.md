# AlpaRodh — Model Selection: Literature Review & Recommendations

## 📌 Your Current Setup

Your project currently uses **two traditional ML models** in [ai_predictor.py](file:///c:/Users/Smarth%20Kaushal/OneDrive/Desktop/New%20folder/PARAM/src/ai_predictor.py):

| Model | Task | Type |
|-------|------|------|
| **Random Forest** (200 trees, depth 10) | Waste Classifier — predicts if a job will waste energy | Classification |
| **Gradient Boosting** (200 trees, depth 6) | Energy Predictor — forecasts per-job energy (Wh) | Regression |

Both operate on **tabular features** (core allocation, power readings, runtime, GPU flags) from the PM100/Marconi100 dataset (~231K records).

---

## 📚 What Does the Literature Say?

### 1. Tree-Based Models Dominate on Tabular HPC Data

Recent surveys (2024–2025) consistently find that **tree-based ensembles (Random Forest, XGBoost, LightGBM, Gradient Boosting) remain the top performers for structured/tabular HPC job data**:

- **Random Forest** is widely used as both a baseline and a production model for HPC energy prediction. Its ensemble nature handles non-linear feature interactions well without extensive hyperparameter tuning.
- **XGBoost/LightGBM** often slightly outperform both RF and Gradient Boosting on the same tabular tasks, with faster training and better regularization.
- Studies on the PM100 dataset itself (from CINECA/University of Bologna) use tree-based models as the primary approach for job-level power estimation at submission time.

> [!IMPORTANT]
> **Key finding**: For tabular features (what you have), tree-based models are not just "okay" — they are **state-of-the-art**. Multiple 2024-2025 benchmarks confirm this.

### 2. When Deep Learning Adds Value

Deep learning models shine in specific scenarios that **may or may not apply** to your project:

| Model | Best When | Your Scenario |
|-------|-----------|---------------|
| **LSTM / GRU** | Time-series data with temporal dependencies (e.g., real-time power monitoring over time) | ❌ Your data is per-job snapshots, not time-series |
| **CNN-LSTM-Attention** | High-frequency temporal data with spatial features | ❌ No spatial/temporal structure in your features |
| **Transformer** | Long-range sequential dependencies, very large datasets | ❌ 231K tabular records don't benefit from self-attention |
| **MLP / Deep Neural Net** | Very high-dimensional tabular data, massive datasets (millions+) | ⚠️ Marginal — your 14 features are well-handled by trees |

### 3. The "Tabular Data" Consensus (2024-2025)

A strong consensus has emerged in recent ML literature:

> **"For structured/tabular data, gradient-boosted decision trees (XGBoost, LightGBM) consistently match or outperform deep learning models, while being faster, more interpretable, and requiring less compute."**

Key papers supporting this:
- Grinsztajn et al. — *"Why do tree-based models still outperform deep learning on tabular data?"*
- Multiple systematic reviews on energy forecasting confirm that data quality and feature engineering matter more than model complexity
- CINECA researchers working with PM100 data primarily use tree-based approaches

### 4. Where Deep Learning IS Used in HPC Energy

- **Real-time power monitoring**: LSTM models predict power draw second-by-second during job execution (your project predicts *before* execution — different use case)
- **Long-term facility forecasting**: Transformers predict data center energy over weeks/months
- **HPCBERT+**: A specialized NLP-style model that encodes job scripts/metadata as sequences — this is novel but requires fundamentally different input data

---

## 🔍 Should You Add Deep Learning Models?

### Short Answer: **Not necessary, but you can strategically add 1-2 for comparison**

### Detailed Analysis

#### ✅ Arguments FOR sticking with your current 2 models:
1. **Your data is tabular** — tree models are proven best here
2. **97.4% accuracy** is already excellent for the waste classifier
3. **Interpretability matters** — feature importances from RF/GB directly support your optimization strategies (Core-Park, DVFS)
4. **Simplicity** — no PyTorch/TensorFlow dependency, fast training, easy deployment
5. **Literature supports it** — PM100 researchers themselves use tree-based approaches

#### ⚠️ Arguments FOR adding deep learning (for academic rigor):
1. **Comparative analysis** strengthens any paper/presentation — showing "we evaluated DL and trees outperformed" is more credible than only showing trees
2. **XGBoost** (not deep learning, but a missing strong baseline) would be a quick and impactful addition
3. A **simple MLP** (2-3 hidden layers) is easy to add and shows you considered neural approaches
4. Reviewers/evaluators may expect to see DL explored

---

## 💡 Recommended Model Lineup (4 models total)

If you want to strengthen your project, here's the optimal expansion:

### Tier 1: Keep (Already Implemented)
| # | Model | Task | Justification |
|---|-------|------|---------------|
| 1 | **Random Forest** | Waste Classifier | Strong baseline, interpretable |
| 2 | **Gradient Boosting** | Energy Predictor | Good for regression tasks |

### Tier 2: Add (High Impact, Low Effort)
| # | Model | Task | Justification |
|---|-------|------|---------------|
| 3 | **XGBoost** | Both tasks | Literature's top performer for tabular data; direct comparison with RF and GB |
| 4 | **Simple MLP** (Neural Net) | Both tasks | Shows you evaluated deep learning; 2-3 hidden layers with ReLU is sufficient |

### Tier 3: Optional (Only if time permits)
| # | Model | Task | Justification |
|---|-------|------|---------------|
| 5 | **LSTM** | Energy Predictor | Only if you reframe data as sequences (jobs sorted by submission time) |
| 6 | **1D-CNN** | Waste Classifier | Pattern detection on feature vectors — quick to implement |

> [!TIP]
> **The sweet spot is 4 models** (RF + GB + XGBoost + MLP). This gives you tree-based vs neural network comparison without overcomplicating the project. You can present a comparison table showing XGBoost wins on tabular data, which aligns with the literature.

---

## 📊 What a Model Comparison Would Look Like

```
┌─────────────────────┬──────────┬───────────┬────────┬─────────┐
│ Model               │ Accuracy │ Precision │ Recall │ F1      │
├─────────────────────┼──────────┼───────────┼────────┼─────────┤
│ Random Forest       │ 97.4%    │ ...       │ ...    │ ...     │
│ XGBoost             │ ~97-98%  │ ...       │ ...    │ ...     │
│ Gradient Boosting   │ ...      │ ...       │ ...    │ ...     │
│ MLP (Neural Net)    │ ~95-96%  │ ...       │ ...    │ ...     │
│ LSTM (if added)     │ ~94-96%  │ ...       │ ...    │ ...     │
└─────────────────────┴──────────┴───────────┴────────┴─────────┘
```

> [!NOTE]
> Based on literature, tree-based models (RF, XGBoost) will likely outperform neural networks on this tabular dataset. This is itself a valuable finding to report.

---

## 📝 Key References

1. **PM100 Dataset** — Zenodo/CINECA: Job-level telemetry from Marconi100 supercomputer
2. **Grinsztajn et al.** — "Why do tree-based models still outperform deep learning on tabular data?" (NeurIPS 2022, still highly cited in 2024-2025)
3. **CNN-LSTM-Attention hybrids** — Used for time-series energy forecasting (not per-job prediction)
4. **HPCBERT+** — Sequence-based HPC job encoding (requires different input format)
5. **ExaMon Project** — CINECA's intelligent HPC monitoring system using tree-based models
6. **Systematic reviews (2024-2025)** — Consensus that data quality > model complexity for energy forecasting

---

## ❓ Decision Points for You

1. **Do you want me to add XGBoost + MLP to your existing codebase?** (Recommended — ~30 min of work, high impact)
2. **Should we add a full model comparison table to the dashboard?**
3. **Do you want LSTM/Transformer explored?** (Only worthwhile if you want to reframe data as time-series)
