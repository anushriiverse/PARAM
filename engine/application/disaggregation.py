"""
engine/application/disaggregation.py
====================================
Village-level Rainfall Disaggregation and Mass-Conserving Renormalization.
Implements per-cell area-weighted renormalization of rain_ratio and effective_ratio
across all 0.25° forecast cells, strictly preserving total cell precipitation mass:
    sum_k (w_k * rain_ratio_norm_k) = 1.0
    sum_k (w_k * effective_ratio_norm_k) = 1.0
    rain_mm = round(cell_precip_sum_mm * effective_ratio_norm, 2)
"""

import numpy as np
import pandas as pd


def renormalize_cell_ratios(df_transfer: pd.DataFrame, df_corr: pd.DataFrame) -> pd.DataFrame:
    """
    Renormalizes rain_ratio within each 0.25° grid cell by the cell's
    polygon-area-weighted mean ratio, ensuring area-weighted mean equals 1.0 per cell.
    
    Parameters
    ----------
    df_transfer : pd.DataFrame
        Village transfer table (16,943 villages) containing village_id, node_lat, node_lon, rain_ratio.
    df_corr : pd.DataFrame
        Village corrections table containing village_id, polygon_area_km2.
        
    Returns
    -------
    pd.DataFrame
        Updated df_transfer with strictly mass-conserving rain_ratio.
    """
    df = df_transfer.copy()
    area_map = dict(zip(df_corr['village_id'], df_corr['polygon_area_km2']))
    df['polygon_area_km2'] = df['village_id'].map(area_map)
    df['cell_id'] = list(zip(np.round(df['node_lat'], 2), np.round(df['node_lon'], 2)))

    if df['polygon_area_km2'].isna().any():
        raise ValueError("Missing polygon area for one or more villages.")

    cell_mean_ratios = {}
    for cid, grp in df.groupby('cell_id'):
        w = grp['polygon_area_km2'].values
        cell_mean_ratios[cid] = float(np.sum(grp['rain_ratio'].values * w) / np.sum(w))

    cell_means = df['cell_id'].map(cell_mean_ratios).values
    df['rain_ratio'] = df['rain_ratio'] / cell_means

    df = df.drop(columns=['polygon_area_km2', 'cell_id'])
    return df


def audit_cell_mass_conservation(df_forecast: pd.DataFrame, df_corr: pd.DataFrame, ratio_col: str = 'effective_ratio'):
    """
    Computes area-weighted mean ratio error per cell across all cells:
        error_c = abs(sum_k(w_k * ratio_k) / sum_k(w_k) - 1.0)
    Returns (worst_cell_error, mean_cell_error, per_cell_errors_dict).
    """
    area_map = dict(zip(df_corr['village_id'], df_corr['polygon_area_km2']))
    if 'node_lat' in df_forecast.columns and 'node_lon' in df_forecast.columns:
        cells = list(zip(np.round(df_forecast['node_lat'], 2), np.round(df_forecast['node_lon'], 2)))
    else:
        node_map_lat = dict(zip(df_corr['village_id'], np.round(df_corr['node_lat'], 2)))
        node_map_lon = dict(zip(df_corr['village_id'], np.round(df_corr['node_lon'], 2)))
        cells = list(zip(df_forecast['village_id'].map(node_map_lat), df_forecast['village_id'].map(node_map_lon)))

    df_temp = pd.DataFrame({
        'cell': cells,
        'w': df_forecast['village_id'].map(area_map).values,
        'r': df_forecast[ratio_col].values
    })
    cell_errors = {}
    for c, grp in df_temp.groupby('cell'):
        w_sum = grp['w'].sum()
        if w_sum > 0:
            weighted_mean = (grp['r'] * grp['w']).sum() / w_sum
            cell_errors[c] = abs(weighted_mean - 1.0)

    err_values = list(cell_errors.values())
    worst_err = max(err_values)
    mean_err = float(np.mean(err_values))
    return worst_err, mean_err, cell_errors
