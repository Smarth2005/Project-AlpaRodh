import pandas as pd
from src.optimizer import core_park_optimization, job_consolidation_score

def test_core_park_savings():
    # Mock dataframe with one inefficient job (over-allocated by 16 cores)
    df = pd.DataFrame({
        'job_id': [1],
        'num_cores_alloc': [32],
        'num_cores_req': [16],
        'run_time': [3600],  # 1 hour
        'node_pwr_w': [300.0],
        'energy_wh': [300.0]
    })
    
    # We power-gate 16 unused cores
    df, saved_kwh, savings_pct = core_park_optimization(df, reduction_factor=0.2)
    
    assert saved_kwh > 0
    assert 'corepark_pwr_w' in df.columns
    assert df['corepark_pwr_w'].iloc[0] < 300.0

def test_job_consolidation_score():
    df = pd.DataFrame({
        'num_cores_alloc': [32, 64, 16],
        'num_cores_req': [16, 32, 16],
        'run_time': [3600, 3600, 3600],
        'energy_wh': [300.0, 600.0, 150.0]
    })
    
    score, potential_savings = job_consolidation_score(df)
    
    # Total req = 64, Total alloc = 112
    # Waste ratio = (112 - 64) / 112 = 48 / 112 = 0.428...
    # Score is bounded [0, 1]
    assert 0 <= score <= 1
    assert score > 0.4
