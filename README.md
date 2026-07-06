<div align="center">

# अल्परोध · AlpaRodh

### *अल्प (Minimal) + रोध (Resistance) = AlpaRodh*

**AI-Driven Variable Resistance Reduction for India's Supercomputers**

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104%2B-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-00F5D4?style=for-the-badge)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/Smarth2005/Project-AlpaRodh/python-app.yml?style=for-the-badge&label=CI&logo=github-actions)](https://github.com/Smarth2005/Project-AlpaRodh/actions)

<br/>

> **Supercomputers waste electricity every second.** Not because they're doing too much — but because they're doing too little with what they've been given. AlpaRodh identifies and eliminates this hidden waste using AI, before it happens.

<br/>

[🚀 Live Demo](https://project-alparodh.onrender.com) &nbsp;·&nbsp; [📊 Dashboard](https://project-alparodh.onrender.com) &nbsp;·&nbsp; [📖 Docs](#-architecture) &nbsp;·&nbsp; [🐛 Issues](https://github.com/Smarth2005/Project-AlpaRodh/issues)

</div>

---

## ⚡ The Problem: Invisible Electricity Waste

Every job running on a supercomputer is allocated a set of CPU cores. But when a job only *uses* 10 cores out of 32 it was given, the remaining 22 cores sit **idle — yet still draw power**. This is **Variable Resistance** — the dynamic friction between what's allocated and what's actually needed.

```
Job Request:  ████████████████░░░░░░░░░░░░░░░░  (10 of 32 cores used)
                               ^^^^^^^^^^^^^^^^^^^
                               THIS power is wasted — AlpaRodh targets this
```

At India's PARAM Yuva-II scale, this waste costs **kilowatt-hours of electricity and kilograms of CO₂** every day — on a grid that's **3.13× more carbon-intensive** than the European systems where most HPC research originates.

---

## 🎯 What AlpaRodh Does

AlpaRodh is an end-to-end AI framework that:

| Step | What Happens |
|------|-------------|
| 📥 **Ingest** | Loads 231,238 job telemetry records from the PM100 (Marconi100) supercomputer |
| 🧮 **Baseline** | Calculates total energy consumption, separating static vs. variable resistance |
| 🔍 **Detect** | Identifies 34,681 over-allocated jobs (14.99% of all jobs) |
| 🤖 **Predict** | 97.4%-accurate AI classifier flags wasteful jobs *before they run* |
| ⚡ **Optimize** | Applies Core-Park, DVFS, and Consolidation strategies |
| 🌿 **Quantify** | Translates savings into CO₂, trees, driving km, and phone charges |
| 🇮🇳 **Map** | Projects results onto PARAM Yuva-II (CDAC Pune) with India's grid factor |
| 📊 **Visualize** | Interactive multilingual dashboard with live AI predictions |

---

## 📊 Key Results

<div align="center">

| 🏷️ Metric | 📈 Value | 🌍 Context |
|-----------|---------|----------|
| Jobs Analyzed | **231,238** | Full PM100 dataset |
| Baseline Energy | **1,257.58 kWh** | Powers an Indian home for 359 days |
| Energy Saved | **39.80 kWh (3.16%)** | Equivalent to 1.3 trees planted |
| CO₂ Prevented (India) | **28.66 kg** | 136 km of driving avoided |
| Classifier Accuracy | **97.4%** | Random Forest (Best) |
| Energy Predictor R² | **0.8915** | Gradient Boosting (Best) |
| AlpaRodh Coefficient | **ηα = 7.3241 gCO₂/kWh** | Environmental ROO |
| Models Compared | **6 classifiers + 6 regressors** | TOPSIS multi-criteria ranking |
| PARAM Yuva-II Projection | **24.10 kWh saved** | India-specific impact |

</div>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                       AlpaRodh Pipeline                             │
│                                                                     │
│   PM100 Dataset           Analysis Core            Dashboard        │
│   ┌──────────┐    ┌───────────────────────┐   ┌──────────────┐    │
│   │ 231,238  │───▶│  data_loader.py       │   │  index.html  │    │
│   │ job logs │    │  baseline.py          │──▶│  app.js      │    │
│   └──────────┘    │  optimizer.py         │   │  style.css   │    │
│                   │  ai_predictor.py      │   └──────┬───────┘    │
│   PARAM Mapping   │  carbon_footprint.py  │          │             │
│   ┌──────────┐    │  param_mapper.py      │   FastAPI Backend      │
│   │ Yuva-II  │◀───│  topsis.py           │   ┌──────────────┐    │
│   │ India 🇮🇳 │    │  translator.py       │◀──│   api.py     │    │
│   └──────────┘    └───────────────────────┘   └──────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### PARAM Yuva-II — Target System (CDAC Pune)

| Component | CPU Nodes | GPU Nodes |
|-----------|-----------|-----------|
| **CPU** | Intel Xeon E5-2670 (8-core) | Intel Xeon E5-2650 (8-core) |
| **GPU** | — | NVIDIA Tesla M2090 |
| **Node Count** | 340 | 36 |
| **Grid CO₂** | 720 gCO₂/kWh | (India grid factor) |

---

## 🤖 AI/ML Engine

AlpaRodh trains and rigorously compares **12 models** using TOPSIS multi-criteria decision-making:

### Waste Classifiers — *Is this job wasteful?*
```
🥇 Random Forest        ── Accuracy: 97.4%  │ F1: 92.2%  │ Precision: 95.2%
🥈 XGBoost              ── Accuracy: 96.8%  │ F1: 91.5%  │ Precision: 94.1%
🥉 Gradient Boosting    ── Accuracy: 96.1%  │ F1: 90.8%  │ Precision: 93.4%
   MLP Neural Network   ── Accuracy: 95.3%  │ F1: 89.7%  │ Precision: 92.0%
   SVM                  ── Accuracy: 94.7%  │ F1: 88.9%  │ Precision: 91.3%
   Logistic Regression  ── Accuracy: 91.2%  │ F1: 85.1%  │ Precision: 87.6%
```

### Energy Predictors — *How many Wh will this job use?*
```
🥇 Gradient Boosting    ── R²: 0.8915 │ MAE: 0.21 Wh │ RMSE: 1.45 Wh
🥈 XGBoost              ── R²: 0.8801 │ MAE: 0.24 Wh │ RMSE: 1.58 Wh
🥉 Random Forest        ── R²: 0.8634 │ MAE: 0.28 Wh │ RMSE: 1.72 Wh
   MLP Neural Network   ── R²: 0.8412 │ MAE: 0.31 Wh │ RMSE: 1.89 Wh
   SVR                  ── R²: 0.7923 │ MAE: 0.38 Wh │ RMSE: 2.14 Wh
   Ridge Regression     ── R²: 0.7341 │ MAE: 0.44 Wh │ RMSE: 2.51 Wh
```

### Top Predictive Features (Importance)
```
mismatch_ratio     ████████████████████████████████ 34.21%
core_mismatch      ████████████████████             21.56%
power_per_core     ████████████                     12.87%
num_cores_alloc    █████████                         9.34%
cpu_to_node_ratio  ████████                          8.12%
node_pwr_w         █████                             5.67%
run_time           ████                              4.23%
```

---

## ⚙️ Optimization Strategies

### 1. 🅿️ Core-Park
Power-gate idle cores in over-allocated jobs. When a job requests 10 but gets 32 cores, AlpaRodh triggers hardware power-gating on the 22 idle cores.
- **Savings:** 37.21 kWh (2.96% of baseline)
- **Applicable to:** 34,681 jobs (14.99%)

### 2. ⚡ DVFS — Dynamic Voltage & Frequency Scaling
For memory-bound workloads, CPU frequency can be lowered with minimal performance impact but significant power reduction (~12% per job).
- **Savings:** 5.12 kWh (0.41%)
- **Applicable to:** 45,230 memory-bound jobs

### 3. 📦 Job Consolidation
Bin-packing score identifies opportunities to co-schedule small jobs on shared nodes, eliminating half-empty node waste.
- **Consolidation Score:** 0.1499
- **Potential additional savings:** 18.86 kWh

---

## 🌿 Green Score System

Every job analyzed receives an environmental grade:

| Grade | CO₂ per Job | Verdict | Recommended Action |
|:-----:|-------------|---------|-------------------|
| **A** 🟢 | ≤ 0.5 g | Excellent | None needed |
| **B** 🔵 | ≤ 1.0 g | Good | Monitor trends |
| **C** 🟡 | ≤ 2.0 g | Average | Review core allocation |
| **D** 🟠 | ≤ 5.0 g | Below Average | Apply Core-Park |
| **F** 🔴 | > 5.0 g | Poor | Priority optimization target |

---

## 📁 Project Structure

```
Project-AlpaRodh/
│
├── 📂 .github/workflows/
│   └── python-app.yml          # CI/CD — pytest on every push
│
├── 📂 data/
│   └── job_table.parquet       # PM100 dataset (231,238 records)
│
├── 📂 src/                     # Core Python modules
│   ├── api.py                  # FastAPI backend + dashboard serving
│   ├── config.py               # Hardware specs & thresholds
│   ├── data_loader.py          # Data ingestion & cleaning
│   ├── baseline.py             # Energy baseline calculations
│   ├── optimizer.py            # Core-Park, DVFS, Consolidation
│   ├── ai_predictor.py         # 12-model ML engine (centrepiece)
│   ├── topsis.py               # TOPSIS multi-criteria ranking
│   ├── param_mapper.py         # PM100 → PARAM Yuva-II scaling
│   ├── carbon_footprint.py     # CO₂ & Green Score engine
│   ├── translator.py           # Multilingual explainer (EN/HI/MR)
│   └── run_analysis.py         # Main pipeline orchestrator
│
├── 📂 dashboard/               # Interactive web dashboard
│   ├── index.html              # Single-page application shell
│   ├── app.js                  # Chart.js + live AI predictor
│   ├── style.css               # Dark glassmorphism UI
│   └── data.json               # Pre-computed analysis results
│
├── 📂 models/                  # Saved ML models (.pkl) & comparison CSVs
├── 📂 tests/                   # pytest unit test suite (4 modules)
│
├── Dockerfile                  # Production Docker image
├── requirements.txt            # Python dependencies
├── literature_review.md        # Model selection justification
└── system_architecture.md      # Detailed system design document
```

---

## 🚀 Quick Start

### ☁️ Option 1: Live Demo *(No setup required)*
Visit **[project-alparodh.onrender.com](https://project-alparodh.onrender.com)**

> ⚠️ Render free tier spins down after inactivity. First load may take ~60 seconds to wake up.

---

### 🐳 Option 2: Docker *(Recommended)*

```bash
git clone https://github.com/Smarth2005/Project-AlpaRodh.git
cd Project-AlpaRodh

docker build -t alparodh .
docker run -p 8000:8000 alparodh

# Open http://localhost:8000
```

---

### 🐍 Option 3: Native Python

```bash
# 1. Clone
git clone https://github.com/Smarth2005/Project-AlpaRodh.git
cd Project-AlpaRodh

# 2. Virtual environment
python -m venv venv
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate           # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run full analysis pipeline (trains 12 models, exports data.json)
python -m src.run_analysis

# 5. Start server
uvicorn src.api:app --reload --host 0.0.0.0 --port 8000

# 6. Open http://localhost:8000
```

---

### 🧪 Run Tests

```bash
pytest tests/ -v
```

---

## 🖥️ Dashboard Features

| Feature | Description |
|---------|-------------|
| 📊 **4 Live Charts** | Energy comparison, feature importance, Green Score distribution, India vs Italy CO₂ |
| 🤖 **Live AI Predictor** | Enter job parameters → instant AI prediction (Energy Wh + Waste classification) |
| 📋 **Job Analysis Report** | Downloadable PDF with AI verdict, Green Score, carbon footprint & optimization recommendations |
| 🌐 **3 Languages** | Switch English ↔ Hindi ↔ Marathi in real-time |
| 📱 **Responsive** | Works on desktop and tablet |

---

## 🌏 India-Specific Context

Most HPC research uses European datasets on low-carbon grids. AlpaRodh specifically addresses the **India gap**:

```
Italy grid:  230 gCO₂/kWh  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░
India grid:  720 gCO₂/kWh  ████████████████████████████████████████
                                                                    ↑
                             3.13× more carbon-intensive
                             Every kWh saved in India prevents 3.13× more pollution
```

AlpaRodh uses PM100 (Marconi100, CINECA Italy) as a scientifically valid analogue for PARAM Yuva-II (CDAC Pune) — both are hybrid CPU-GPU clusters with similar architectural profiles — while applying **India's actual grid carbon factor** for all environmental calculations.

---

## 🔬 The AlpaRodh Coefficient (ηα)

A novel metric measuring *environmental return on optimization*:

```
         CO₂ Saved (g)
ηα  =  ──────────────────   =  7.3241 gCO₂ per kWh optimized
         Energy Saved (kWh)
```

This answers: *"For every 1 kWh of waste AlpaRodh eliminates, how much CO₂ is prevented?"*

See [`literature_review.md`](literature_review.md) for model selection justification and [`system_architecture.md`](system_architecture.md) for the complete technical design.

---

## ⚠️ Scope & Limitations

- **Offline Analysis:** AlpaRodh trains on historical telemetry and serves predictions via API. It is **not** a real-time OS-level scheduler interceptor.
- **Simulated Real-Time:** The FastAPI backend simulates real-time prediction by serving pre-trained models — the production equivalent would integrate at the SLURM/PBS scheduler level.
- **Dataset Analogy:** PM100 (Italy) is used as a proxy for PARAM Yuva-II (India). Architectural similarities justify this, but production deployment would require native PARAM telemetry.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add: your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for India's HPC ecosystem**

*Targeting CDAC Pune's PARAM Yuva-II · Trained on CINECA Italy's Marconi100*

---

*अल्प (Minimal) + रोध (Resistance) = **अल्परोध** — AlpaRodh*

</div>
