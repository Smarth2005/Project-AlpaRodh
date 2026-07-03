# अल्परोध (AlpaRodh) — Minimal Resistance

> **AI-Driven Variable Resistance Reduction for India's Supercomputers**

AlpaRodh is an AI-powered framework that analyzes and optimizes energy consumption in High-Performance Computing (HPC) systems by intelligently reducing variable resistance (dynamic power dissipation) in supercomputer nodes.

## 🎯 Core Concept

Supercomputer nodes have two power components:
- **Static (Fixed Resistance)**: Base idle power — fans, circuitry, always-on systems
- **Variable (Dynamic Resistance)**: Power proportional to CPU/GPU utilization — **this is what AlpaRodh optimizes**

By predicting and reducing wasteful dynamic power through AI/ML models, AlpaRodh achieves measurable energy savings and CO₂ reduction.

## 📊 Dataset

- **PM100 (Marconi100)** — 231,238 job telemetry records from CINECA, Italy
- Used as a scientifically valid analogue for **PARAM Yuva-II** (CDAC Pune)
- Both are hybrid CPU-GPU clusters with similar architectural principles

## 🏗️ Architecture: PARAM Yuva-II (Target System)

| Component | CPU Nodes | GPU Nodes |
|-----------|-----------|-----------|
| CPU | Intel Xeon E5-2670 (8-core) | Intel Xeon E5-2650 (8-core) |
| GPU | — | NVIDIA Tesla M2090 |
| Node Count | 340 | 36 |

## ⚠️ System Architecture & Limitations

It is critical to note that AlpaRodh is designed as an **offline analysis and prediction tool**, not a real-time production interceptor.

- **Offline Batch Processing:** The pipeline (`run_analysis.py`) trains ML models and calculates theoretical energy savings on historical telemetry data (`job_table.parquet`).
- **Simulated Real-Time Interaction:** True real-time interception of slurm/PBS job submissions is simulated via our FastAPI backend (`src/api.py`), allowing users to query the trained models in real-time through the dashboard. However, it is not deployed at the OS-scheduler level in production.

## 🔧 Features

### Optimization Strategies
1. **Core-Park**: Power-gate idle cores in over-allocated jobs
2. **DVFS**: Dynamic Voltage/Frequency Scaling for memory-bound workloads
3. **Job Consolidation**: Bin-packing efficiency scoring

### AI/ML Engine (Multi-Model Comparison)
Trains and compares **6 classifiers × 6 regressors = 12 models** with TOPSIS-ready CSV export.

**Waste Classifiers**: Random Forest, XGBoost, Gradient Boosting, MLP (Neural Net), SVM, Logistic Regression
**Energy Predictors**: Gradient Boosting, XGBoost, Random Forest, MLP (Neural Net), SVR, Ridge Regression

See [`literature_review.md`](literature_review.md) for model selection justification.

### Carbon Footprint
- CO₂ emission calculations (India & Italy grid factors)
- **AlpaRodh Coefficient (ηα)**: Environmental Return on Optimization
- Green Score grading system (A–F)
- Real-world equivalences (trees, driving, phone charges)

### Multilingual Support
- English, Hindi (हिंदी), Marathi (मराठी)
- Technical metrics explained in layman language

## 🚀 Quick Start

### Option 1: Native Python

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the full analysis pipeline (Trains 12 models & exports data)
python -m src.run_analysis

# 3. Start the FastAPI Backend (which also serves the dashboard!)
uvicorn src.api:app --reload

# Open http://localhost:8000 in your browser
```

### Option 2: Docker (Recommended)

```bash
# Build the image
docker build -t alparodh .

# Run the container
docker run -p 8000:8000 alparodh

# Open http://localhost:8000 in your browser
```

## 📁 Project Structure

```
PARAM/
├── .github/workflows/                # CI/CD pipelines (GitHub Actions)
├── data/job_table.parquet            # PM100 dataset
├── src/                              # Core Python modules
│   ├── api.py                        # FastAPI Backend & Dashboard serving
│   ├── config.py                     # Configuration & hardware specs
│   ├── data_loader.py                # Data ingestion & cleaning
│   ├── baseline.py                   # Energy baseline calculations
│   ├── optimizer.py                  # Optimization strategies
│   ├── ai_predictor.py               # Multi-model ML engine (centerpiece)
│   ├── topsis.py                     # TOPSIS multi-criteria decision making
│   ├── param_mapper.py               # PM100 → PARAM Yuva-II mapping
│   ├── carbon_footprint.py           # CO₂ & Green Scoring
│   ├── translator.py                 # Multilingual explainer
│   └── run_analysis.py               # Main pipeline
├── dashboard/                        # Interactive web dashboard (HTML/JS/CSS)
├── models/                           # Saved ML models & comparison CSVs
├── tests/                            # Unit test suite (pytest)
├── Dockerfile                        # Docker containerization configuration
├── requirements.txt                  # Python dependencies
├── literature_review.md              # Model selection justification
└── README.md                         # Project documentation
```

## 🏆 Key Results

| Metric | Value |
|--------|-------|
| Jobs Analyzed | 231,238 |
| Baseline Energy | 1,257.58 kWh |
| Energy Saved | ~38.23 kWh (3.04%) |
| CO₂ Prevented (India) | ~27.53 kg |
| AlpaRodh Coefficient | ~7.03 gCO₂/kWh |
| Models Compared | 6 classifiers + 6 regressors |
| Best Classifier | *(see classifier_comparison.csv)* |
| Best Regressor | *(see regressor_comparison.csv)* |

## 📜 Theme

**AI for Energy Saving**

---

*अल्प (Minimal) + रोध (Resistance) = अल्परोध (AlpaRodh)*
