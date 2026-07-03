import pandas as pd
import numpy as np

def calculate_topsis(data_df, criteria_cols, weights, impacts):
    """
    Calculate TOPSIS scores and rank for the given dataframe.
    
    Args:
        data_df (pd.DataFrame): The dataframe containing the models and metrics.
        criteria_cols (list): List of column names to use as criteria.
        weights (list): List of numerical weights for each criterion.
        impacts (list): List of impacts ('+' or '-') for each criterion.
        
    Returns:
        pd.DataFrame: The dataframe with 'Topsis Score' and 'Rank' added, sorted by Rank.
    """
    df = data_df.copy()
    
    # Extract criteria data
    data = df[criteria_cols].apply(pd.to_numeric, errors="coerce").to_numpy(dtype=float)

    # Step 1: Vector Normalization
    rss = np.sqrt((data ** 2).sum(axis=0))
    # Avoid division by zero
    rss[rss == 0] = 1e-10

    data = data / rss
    
    # Step 2: Calculate weighted normalized matrix
    weights = np.array(weights)
    data = data * weights
    
    # Step 3: Determine ideal best (V+) and ideal worst (V-) solutions
    n = data.shape[1]
    v_plus = np.zeros(n)
    v_minus = np.zeros(n)

    for j in range(n):
        column = data[:,j]
        max_val = np.max(column)
        min_val = np.min(column)
    
        if impacts[j] == '+':
            v_plus[j] = max_val
            v_minus[j] = min_val
        else:
            v_plus[j] = min_val
            v_minus[j] = max_val
    
    # Step 4: Calculate Euclidean Distances
    s_plus = np.sqrt(((data - v_plus)**2).sum(axis=1))
    s_minus = np.sqrt(((data - v_minus)**2).sum(axis=1))
    
    # Step 5: Calculate Performance Score (TOPSIS Score)
    # Avoid division by zero if both s_plus and s_minus are 0
    denominator = s_plus + s_minus
    denominator[denominator == 0] = 1e-10
    
    topsis_score = s_minus / denominator
    
    # Step 6: Ranking
    df['Topsis Score'] = topsis_score.round(4)
    df['Rank'] = df['Topsis Score'].rank(method="dense", ascending=False).astype(int)
    
    # Sort by rank
    df = df.sort_values(by='Rank')
    
    return df
