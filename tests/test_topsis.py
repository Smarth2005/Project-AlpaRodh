import pandas as pd
from src.topsis import calculate_topsis

def test_calculate_topsis():
    # Create sample data where Model A is clearly better (higher accuracy, lower time)
    data = pd.DataFrame({
        'Model': ['A', 'B', 'C'],
        'Accuracy': [0.95, 0.85, 0.75],
        'Time': [10.0, 50.0, 100.0]
    })
    
    # We want to maximize Accuracy (weight 1.0) and minimize Time (weight 1.0)
    criteria = ['Accuracy', 'Time']
    weights = [1.0, 1.0]
    impacts = ['+', '-'] # '+' for maximize, '-' for minimize
    
    result_df = calculate_topsis(data, criteria, weights, impacts)
    
    # Check that TOPSIS Score is in the result
    assert 'Topsis Score' in result_df.columns
    assert 'Rank' in result_df.columns
    
    # Verify Model A is ranked 1st
    top_model = result_df[result_df['Rank'] == 1]['Model'].values[0]
    assert top_model == 'A'
    
    # Verify Model C is ranked 3rd (lowest)
    bottom_model = result_df[result_df['Rank'] == 3]['Model'].values[0]
    assert bottom_model == 'C'
