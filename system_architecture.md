# AlpaRodh System Architecture

This diagram illustrates the precise data flow and module structure of the AlpaRodh framework, strictly based on the implemented codebase.

```mermaid
flowchart TB
    subgraph Data Layer
        A[(PM100 Dataset\njob_table.parquet)] -->|Ingest| B(data_loader.py)
        B -->|Flatten Nested Arrays\nmW to W Conversion| C[Cleaned Telemetry DataFrame]
    end

    subgraph Core Analysis Engine
        C --> D(baseline.py)
        D -->|Compute total_kwh, static_floor\nDetect Core Mismatches| E[Baseline Metrics]
        
        C --> F(optimizer.py)
        F -->|Strategy 1| G[Core-Park\nPower-gate idle cores]
        F -->|Strategy 2| H[DVFS\nFreq scale memory-bound]
        F -->|Strategy 3| I[Job Consolidation Score]
        G & H & I --> J[Combined Optimization\nSavings Calculation]
    end

    subgraph AI/ML Predictor Engine
        C --> K(ai_predictor.py)
        K --> L[Feature Engineering\nmismatch_ratio, power_per_core]
        L --> M[Waste Classifier\nRandomForest]
        L --> N[Energy Predictor\nGradientBoosting]
        M -->|Save Joblib| O[(waste_classifier.joblib)]
        N -->|Save Joblib| P[(energy_predictor.joblib)]
    end

    subgraph Projection & Impact Mapping
        J --> Q(param_mapper.py)
        Q -->|CPU vs GPU Node Classification\nTDP Scaling Ratios| R[PARAM Yuva-II\nProjected Metrics]
        
        R --> S(carbon_footprint.py)
        S -->|India Grid vs Italy Grid| T[CO2 Emissions Saved]
        S --> U[AlpaRodh Coefficient ηα]
        S --> V[Green Score A-F & Equivalences]
    end

    subgraph Orchestration & Export
        D & J & K & Q & S --> W(run_analysis.py)
        W --> X(translator.py)
        X -->|Template Engine\nen, hi, mr| Y[Multilingual Report]
        Y -->|JSON Serialization| Z[(dashboard/data.json)]
    end

    subgraph Visualization Frontend
        Z --> UI(dashboard/app.js)
        UI -->|Chart.js| UI_Charts[Energy, Features, Green Score Charts]
        UI -->|DOM Updates| UI_Lang[Multilingual View Switching]
        UI --> UI_Cards[Stats Cards & Glassmorphic UI]
    end

    %% Styling
    classDef file fill:#2d3748,stroke:#4a5568,stroke-width:2px,color:#f7fafc
    classDef data fill:#2b6cb0,stroke:#2c5282,stroke-width:2px,color:#ebf8ff
    classDef process fill:#38a169,stroke:#276749,stroke-width:2px,color:#f0fff4
    classDef frontend fill:#d53f8c,stroke:#97266d,stroke-width:2px,color:#fbb6ce

    class B,D,F,K,Q,S,W,X file
    class A,C,O,P,Z data
    class G,H,I,M,N,L,R,T,U,V,Y process
    class UI,UI_Charts,UI_Lang,UI_Cards frontend
```

### Flow Summary:
1. **Data Layer**: Raw telemetry is standardized and cleaned by the `data_loader.py`.
2. **Analysis**: `baseline.py` isolates variable resistance. `optimizer.py` applies three independent physical logic strategies.
3. **AI Pipeline**: Using the cleaned data, `ai_predictor.py` engineers composite features and trains the `scikit-learn` estimators to predict waste beforehand.
4. **Mapping & Carbon**: `param_mapper.py` transposes the Italian hardware TDPs into Indian equivalents. `carbon_footprint.py` computes the localized environmental impact.
5. **UI & Export**: `run_analysis.py` weaves it all together, applies `translator.py` for Layman accessibility, and outputs a strict JSON file that the web frontend consumes natively.
