# 🏗️ System Architecture: AlpaRodh

This document outlines the detailed system architecture and data flow of the AlpaRodh framework, specifically targeting the translation of telemetry from the **PM100 (Marconi100)** supercomputer to India's **PARAM Yuva-II** supercomputer.

## 📊 End-to-End Data Flow

The following Mermaid diagram illustrates the complete pipeline — from data ingestion to real-time AI prediction and carbon footprint mapping.

```mermaid
graph TD
    %% Styling
    classDef dataset fill:#1e293b,stroke:#94a3b8,stroke-width:2px,color:#f1f5f9
    classDef process fill:#0f172a,stroke:#00f5d4,stroke-width:2px,color:#00f5d4
    classDef model fill:#312e81,stroke:#818cf8,stroke-width:2px,color:#e0e7ff
    classDef target fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#d1fae5
    classDef output fill:#4c1d95,stroke:#a78bfa,stroke-width:2px,color:#ede9fe
    classDef UI fill:#831843,stroke:#f472b6,stroke-width:2px,color:#fce7f3

    %% 1. Ingestion Phase
    subgraph Data_Ingestion ["📥 1. Telemetry Ingestion"]
        A[PM100 Dataset<br/>231,238 Jobs]:::dataset --> B(data_loader.py<br/>Cleaning & Preprocessing):::process
        B --> C[Cleaned Job Table]:::dataset
    end

    %% 2. Baseline & Mapping Phase
    subgraph Baseline_Mapping ["🧮 2. Baseline & Mapping"]
        C --> D(baseline.py<br/>Calculate Static & Variable Power):::process
        D --> E(param_mapper.py<br/>Map PM100 ➔ PARAM Yuva-II):::process
        E --> F[PARAM Target Scaled Baseline]:::target
    end

    %% 3. AI Training Phase
    subgraph AI_Engine ["🤖 3. AI / ML Engine"]
        F --> G(ai_predictor.py<br/>Train 12 Models):::model
        G --> H{TOPSIS Ranking}:::model
        H --> |Best Classifier| I(Waste Classifier<br/>Random Forest):::model
        H --> |Best Regressor| J(Energy Predictor<br/>Gradient Boosting):::model
    end

    %% 4. Optimization Phase
    subgraph Optimization ["⚡ 4. Optimization Strategies"]
        I -.-> K(optimizer.py<br/>Apply Core-Park):::process
        J -.-> L(optimizer.py<br/>Apply DVFS):::process
        I -.-> M(optimizer.py<br/>Job Consolidation):::process
    end

    %% 5. Carbon Footprint Engine
    subgraph Environment ["🌿 5. Environmental Mapping"]
        K & L & M --> N(carbon_footprint.py<br/>Apply India Grid Factor):::target
        N --> O[AlpaRodh Coefficient<br/>Green Score A-F]:::target
    end

    %% 6. Deployment / UI
    subgraph Deployment ["🌐 6. Deployment & Dashboard"]
        I & J --> P[[FastAPI Backend<br/>api.py]]:::output
        O --> P
        P <--> Q{{Interactive Dashboard<br/>Live Job Prediction}}:::UI
        Q --> R[Multilingual Job Report<br/>PDF Export]:::UI
    end
```

---

## 🧩 Core Modules Explained

### 1. `data_loader.py` & `baseline.py`
The foundation of the pipeline. It ingests historical telemetry, isolating **static resistance** (idle power, fans) from **variable resistance** (dynamic CPU/GPU power draw). AlpaRodh's primary objective is eliminating unnecessary variable resistance caused by over-allocation.

### 2. `ai_predictor.py` & `topsis.py`
Instead of relying on a single algorithm, AlpaRodh trains an ensemble of 6 classifiers and 6 regressors. It then utilizes **TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution)** to mathematically rank the models based on a blend of accuracy, precision, F1-score, and computational overhead.

### 3. `param_mapper.py`
Since AlpaRodh specifically targets CDAC Pune's **PARAM Yuva-II**, this module applies a calculated scaling factor (0.6054) to map the PM100 data to the PARAM architecture, considering differences in total nodes, core counts, and GPU presence.

### 4. `optimizer.py`
The execution arm of the framework, applying three specific hardware-level strategies:
- **Core-Park:** Power-gates unused cores on partially utilized nodes.
- **DVFS (Dynamic Voltage & Frequency Scaling):** Lowers CPU frequency for memory-bound jobs.
- **Consolidation:** Generates a bin-packing score to co-schedule smaller jobs.

### 5. `carbon_footprint.py`
Translates raw kWh savings into tangible environmental metrics. Crucially, it applies the **India Grid Carbon Factor (720 gCO₂/kWh)**, highlighting why saving power in India is >3x more environmentally impactful than saving power on European grids.

### 6. `api.py` & `dashboard/`
The bridge between theoretical analysis and real-world interaction. The FastAPI backend serves the pre-trained ML models, allowing users to enter custom job parameters into the interactive web dashboard and receive instantaneous AI predictions and Green Score certifications.
