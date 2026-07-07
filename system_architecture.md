# 🏗️ System Architecture: AlpaRodh

This document outlines the detailed system architecture and data flow of the AlpaRodh framework, specifically targeting the translation of telemetry from the **PM100 (Marconi100)** supercomputer to India's **PARAM Yuva-II** supercomputer.

## 📊 End-to-End Data Flow

The following Mermaid diagram illustrates the complete pipeline — from data ingestion to real-time AI prediction and carbon footprint mapping.

```mermaid
graph TD
    %% Bright & Sophisticated Inner Box Styling (Font Size 12px)
    classDef dataset fill:#E0F2FE,stroke:#0EA5E9,stroke-width:1px,color:#0C4A6E,font-size:12px
    classDef baseline fill:#CCFBF1,stroke:#0D9488,stroke-width:1px,color:#115E59,font-size:12px
    classDef process fill:#EEF2FF,stroke:#6366F1,stroke-width:1px,color:#3730A3,font-size:12px
    classDef model fill:#FFE4E6,stroke:#F43F5E,stroke-width:1px,color:#881337,font-size:12px
    classDef target fill:#D1FAE5,stroke:#10B981,stroke-width:1px,color:#064E3B,font-size:12px
    classDef output fill:#F3F4F6,stroke:#6B7280,stroke-width:1px,color:#1F2937,font-size:12px
    classDef UI fill:#FEF3C7,stroke:#F59E0B,stroke-width:1px,color:#92400E,font-size:12px

    %% Edge Styling (Font Size 12px)
    linkStyle default font-size:12px,stroke:#64748B,stroke-width:2px;

    %% 1. Ingestion Phase
    subgraph Data_Ingestion ["📥 1. Telemetry Ingestion"]
        A[PM100 Raw Dataset<br/>231,238 Active Jobs]:::dataset -->|Raw Telemetry| B(data_loader.py<br/>Clean & Preprocess):::dataset
        B -->|Sanitized Data| C[Cleaned Job Table<br/>Ready for Mapping]:::dataset
    end
    style Data_Ingestion fill:none,stroke:#94A3B8,stroke-width:2px,stroke-dasharray: 5 5

    %% 2. Baseline & Mapping Phase
    subgraph Baseline_Mapping ["🧮 2. Baseline & Mapping"]
        C -->|Job Stats| D(baseline.py<br/>Static/Var Power Calc):::baseline
        D -->|Power Metrics| E(param_mapper.py<br/>Map to PARAM Yuva-II):::baseline
        E -->|Mapped Workloads| F[Target Scaled Baseline<br/>PARAM Architecture]:::baseline
    end
    style Baseline_Mapping fill:none,stroke:#94A3B8,stroke-width:2px,stroke-dasharray: 5 5

    %% 3. AI Training Phase
    subgraph AI_Engine ["🤖 3. AI / ML Engine"]
        F -->|Training Data| G(ai_predictor.py<br/>Train Ensemble Models):::model
        G -->|Model Metrics| H{TOPSIS Algorithm<br/>Mathematical Ranking}:::model
        H -->|Best Classifier| I(Waste Classifier<br/>Random Forest Model):::model
        H -->|Best Regressor| J(Energy Predictor<br/>Gradient Boosting):::model
    end
    style AI_Engine fill:none,stroke:#94A3B8,stroke-width:2px,stroke-dasharray: 5 5

    %% 4. Optimization Phase
    subgraph Optimization ["⚡ 4. Optimization Strategies"]
        I -.->|Waste Class| K(optimizer.py<br/>Apply Core-Park Tech):::process
        J -.->|Energy Pred| L(optimizer.py<br/>Apply DVFS Scaling):::process
        I -.->|Underutilization| M(optimizer.py<br/>Job Consolidation):::process
    end
    style Optimization fill:none,stroke:#94A3B8,stroke-width:2px,stroke-dasharray: 5 5

    %% 5. Carbon Footprint Engine
    subgraph Environment ["🌿 5. Environmental Mapping"]
        K & L & M -->|Optimized kWh| N(carbon_footprint.py<br/>Apply IN Grid Factor):::target
        N -->|Carbon Impact| O[AlpaRodh Coefficient<br/>Green Score Rating]:::target
    end
    style Environment fill:none,stroke:#94A3B8,stroke-width:2px,stroke-dasharray: 5 5

    %% 6. Deployment / UI
    subgraph Deployment ["🌐 6. Deployment & Dashboard"]
        I & J -->|Model Weights| P[[FastAPI Web Backend<br/>api.py Deployment]]:::output
        O -->|Evaluation Logic| P
        P <-->|REST API / JSON| Q{{Interactive Dashboard<br/>Live Job Prediction}}:::UI
        Q -->|Generate Report| R[Multilingual Job Report<br/>Export to PDF File]:::UI
    end
    style Deployment fill:none,stroke:#94A3B8,stroke-width:2px,stroke-dasharray: 5 5
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
