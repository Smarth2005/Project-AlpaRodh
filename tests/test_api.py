from fastapi.testclient import TestClient
from src.api import app

client = TestClient(app)

def test_predict_energy():
    payload = {
        "node_pwr_w": 200.0,
        "cpu_pwr_w": 100.0,
        "mem_pwr_w": 30.0,
        "num_cores_req": 8,
        "num_cores_alloc": 16,
        "run_time": 3600,
        "num_gpus_alloc": 0
    }
    response = client.post("/api/predict/energy", json=payload)
    
    # We expect 200 OK
    assert response.status_code == 200
    data = response.json()
    assert "energy_wh_prediction" in data
    assert isinstance(data["energy_wh_prediction"], float)

def test_predict_waste():
    payload = {
        "node_pwr_w": 200.0,
        "cpu_pwr_w": 100.0,
        "mem_pwr_w": 30.0,
        "num_cores_req": 8,
        "num_cores_alloc": 16, # Mismatch, likely wasteful
        "run_time": 3600,
        "num_gpus_alloc": 0
    }
    response = client.post("/api/predict/waste", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert "is_wasteful" in data
    assert data["is_wasteful"] in [0, 1, True, False]
