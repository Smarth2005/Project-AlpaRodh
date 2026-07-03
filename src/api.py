import os
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional

from . import config

app = FastAPI(
    title="AlpaRodh API",
    description="API for HPC Energy Prediction and PARAM Yuva-II Mapping",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Load models if they exist
classifier_path = os.path.join(config.MODELS_DIR, "waste_classifier.joblib")
classifier_scaler_path = os.path.join(config.MODELS_DIR, "waste_scaler.joblib")
regressor_path = os.path.join(config.MODELS_DIR, "energy_predictor.joblib")
regressor_scaler_path = os.path.join(config.MODELS_DIR, "energy_scaler.joblib")

waste_classifier = None
waste_scaler = None
energy_predictor = None
energy_scaler = None

if os.path.exists(classifier_path):
    waste_classifier = joblib.load(classifier_path)
    waste_scaler = joblib.load(classifier_scaler_path)

if os.path.exists(regressor_path):
    energy_predictor = joblib.load(regressor_path)
    energy_scaler = joblib.load(regressor_scaler_path)

class TelemetryData(BaseModel):
    num_cores_req: int
    num_cores_alloc: int
    node_pwr_w: float
    cpu_pwr_w: float
    mem_pwr_w: float
    run_time: int
    num_gpus_alloc: Optional[int] = 0

# Mount dashboard static files
dashboard_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dashboard")
if os.path.exists(dashboard_dir):
    app.mount("/", StaticFiles(directory=dashboard_dir, html=True), name="dashboard")
else:
    @app.get("/")
    def read_root():
        return {"status": "ok", "message": "AlpaRodh API is running. Dashboard not found."}

@app.post("/api/predict/energy")
def predict_energy(data: TelemetryData):
    if not energy_predictor or not energy_scaler:
        raise HTTPException(status_code=503, detail="Energy Predictor model not loaded.")
        
    import numpy as np
    
    core_mismatch = data.num_cores_alloc - data.num_cores_req
    mismatch_ratio = core_mismatch / data.num_cores_alloc if data.num_cores_alloc > 0 else 0
    cpu_to_node = data.cpu_pwr_w / data.node_pwr_w if data.node_pwr_w > 0 else 0
    mem_to_cpu = data.mem_pwr_w / data.cpu_pwr_w if data.cpu_pwr_w > 0 else 0
    power_per_core = data.node_pwr_w / data.num_cores_alloc if data.num_cores_alloc > 0 else 0
    log_run_time = np.log1p(data.run_time)
    has_gpu = 1 if data.num_gpus_alloc > 0 else 0
    
    features = pd.DataFrame([{
        "num_cores_req": data.num_cores_req,
        "num_cores_alloc": data.num_cores_alloc,
        "core_mismatch": core_mismatch,
        "mismatch_ratio": mismatch_ratio,
        "node_pwr_w": data.node_pwr_w,
        "cpu_pwr_w": data.cpu_pwr_w,
        "mem_pwr_w": data.mem_pwr_w,
        "cpu_to_node_ratio": cpu_to_node,
        "mem_to_cpu_ratio": mem_to_cpu,
        "power_per_core": power_per_core,
        "run_time": data.run_time,
        "log_run_time": log_run_time,
        "num_gpus_alloc": data.num_gpus_alloc,
        "has_gpu": has_gpu
    }])
    
    scaled_features = energy_scaler.transform(features)
    prediction = energy_predictor.predict(scaled_features)[0]
    
    return {"energy_wh_prediction": round(float(prediction), 2)}

@app.post("/api/predict/waste")
def predict_waste(data: TelemetryData):
    if not waste_classifier or not waste_scaler:
        raise HTTPException(status_code=503, detail="Waste Classifier model not loaded.")
        
    import numpy as np
    
    cpu_to_node = data.cpu_pwr_w / data.node_pwr_w if data.node_pwr_w > 0 else 0
    mem_to_cpu = data.mem_pwr_w / data.cpu_pwr_w if data.cpu_pwr_w > 0 else 0
    power_per_core = data.node_pwr_w / data.num_cores_alloc if data.num_cores_alloc > 0 else 0
    log_run_time = np.log1p(data.run_time)
    has_gpu = 1 if data.num_gpus_alloc > 0 else 0
    
    features = pd.DataFrame([{
        "node_pwr_w": data.node_pwr_w,
        "cpu_pwr_w": data.cpu_pwr_w,
        "mem_pwr_w": data.mem_pwr_w,
        "cpu_to_node_ratio": cpu_to_node,
        "mem_to_cpu_ratio": mem_to_cpu,
        "power_per_core": power_per_core,
        "run_time": data.run_time,
        "log_run_time": log_run_time,
        "num_gpus_alloc": data.num_gpus_alloc,
        "has_gpu": has_gpu
    }])
    
    scaled_features = waste_scaler.transform(features)
    prediction = waste_classifier.predict(scaled_features)[0]
    
    return {"is_wasteful": int(prediction)}
