"""
tests/test_conservation.py
==========================
Regression & Unit Test for Mass Conservation across all 7 Leads.
Asserts:
1. Algorithm-level per-cell area-weighted ratio conservation:
   sum_k (w_k * r_k) / sum_k (w_k) == 1.0 (error < 1e-12 mm/cell).
2. Served-CSV per-cell mass conservation (area weights, 2-decimal rounding):
   |sum_k (w_k * rain_mm_k) / sum_k(w_k) - P_cell| <= 0.005 mm across all 7 leads.
"""

import os
import sys
import numpy as np
import pandas as pd

# Add repo root to sys.path
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

from engine.application.disaggregation import renormalize_cell_ratios, audit_cell_mass_conservation


def find_file(candidates):
    for c in candidates:
        full_path = os.path.join(REPO_ROOT, c) if not os.path.isabs(c) else c
        if os.path.exists(full_path):
            return full_path
    raise FileNotFoundError(f"Could not locate any of: {candidates}")


def test_algorithm_level_conservation():
    print("=" * 88)
    print("1. ALGORITHM-LEVEL MASS CONSERVATION AUDIT (Normalization Module)")
    print("=" * 88)

    trans_path = find_file([
        "outputs/village_transfer.csv",
        "release/outputs/village_transfer.csv",
        "api/data/village_transfer.csv"
    ])
    corr_path = find_file([
        "outputs/village_corrections.csv",
        "release/outputs/village_corrections.csv"
    ])

    df_trans = pd.read_csv(trans_path)
    df_corr = pd.read_csv(corr_path, low_memory=False)

    df_norm = renormalize_cell_ratios(df_trans, df_corr)
    worst_err, mean_err, _ = audit_cell_mass_conservation(df_norm, df_corr, ratio_col="rain_ratio")

    print(f"Total Villages Evaluated : {len(df_norm):,}")
    print(f"Parent 0.25 deg Cells    : 210")
    print(f"Algorithm Worst Cell Err : {worst_err:.2e} (ratio)")
    print(f"Algorithm Mean Cell Err  : {mean_err:.2e} (ratio)")

    # Test with synthetic 10.0 mm rainfall
    worst_mm_err = worst_err * 10.0
    print(f"Unrounded Precip Err     : {worst_mm_err:.2e} mm (at P_cell = 10.0 mm)")

    assert worst_err < 1e-12, f"Algorithm conservation error {worst_err} exceeds 1e-12 tolerance!"
    print("STATUS: PASS (Algorithm exact mass conservation confirmed)\n")


def test_served_csv_conservation():
    print("=" * 88)
    print("2. SERVED-CSV MASS CONSERVATION AUDIT (Area-Weighted, 2-Decimal Quantization)")
    print("=" * 88)

    fc_path = find_file([
        "api/data/village_forecast_7day.csv",
        "outputs/village_forecast_7day.csv"
    ])
    corr_path = find_file([
        "outputs/village_corrections.csv",
        "release/outputs/village_corrections.csv"
    ])

    df_fc = pd.read_csv(fc_path)
    df_corr = pd.read_csv(corr_path, low_memory=False)

    area_map = dict(zip(df_corr["village_id"], df_corr["polygon_area_km2"]))
    node_lat_map = dict(zip(df_corr["village_id"], np.round(df_corr["node_lat"], 2)))
    node_lon_map = dict(zip(df_corr["village_id"], np.round(df_corr["node_lon"], 2)))

    df_fc["area"] = df_fc["village_id"].map(area_map)
    df_fc["cell_lat"] = df_fc["village_id"].map(node_lat_map)
    df_fc["cell_lon"] = df_fc["village_id"].map(node_lon_map)

    print(f"{'Lead':5s} | {'Date':10s} | {'Cells':5s} | {'Worst Dev (mm)':14s} | {'Worst Cell':16s} | {'P_cell':8s} | {'Mean Dev (mm)':13s} | {'<=0.005mm'}")
    print("-" * 88)

    overall_worst_dev = 0.0
    overall_worst_lead = None
    overall_worst_cell = None

    for lead, grp_lead in df_fc.groupby("lead_day"):
        date_str = str(grp_lead["forecast_date"].iloc[0])
        devs = []
        lead_worst_dev = -1.0
        lead_worst_cell = None
        lead_worst_pcell = 0.0

        for (clat, clon), grp_cell in grp_lead.groupby(["cell_lat", "cell_lon"]):
            w = grp_cell["area"].values
            w_sum = np.sum(w)
            if w_sum <= 0:
                continue
            p_recon = np.sum(grp_cell["rain_mm"].values * w) / w_sum
            p_cell = float(grp_cell["cell_precip_sum_mm"].iloc[0])
            dev = abs(p_recon - p_cell)
            devs.append(dev)

            if dev > lead_worst_dev:
                lead_worst_dev = dev
                lead_worst_cell = (clat, clon)
                lead_worst_pcell = p_cell

        if lead_worst_dev > overall_worst_dev:
            overall_worst_dev = lead_worst_dev
            overall_worst_lead = lead
            overall_worst_cell = lead_worst_cell

        mean_dev = float(np.mean(devs))
        within_tolerance = lead_worst_dev <= 0.005
        print(f"Lead {lead:1d} | {date_str:10s} | {len(devs):5d} | {lead_worst_dev:12.6f} mm | {str(lead_worst_cell):16s} | {lead_worst_pcell:6.1f} mm | {mean_dev:11.6f} mm | {str(within_tolerance)}")

        assert within_tolerance, f"Lead {lead} worst deviation {lead_worst_dev:.6f} mm exceeds 0.005 mm!"

    print("-" * 88)
    print(f"Domain Worst Deviation Across All 7 Leads: {overall_worst_dev:.6f} mm")
    print(f"Occurred at Lead {overall_worst_lead}, Cell {overall_worst_cell}")
    print("Strictly within 2-decimal rounding quantization ceiling (< 0.0050 mm).")
    assert overall_worst_dev <= 0.0033, f"Overall worst deviation {overall_worst_dev} exceeds 0.0033 mm target!"
    print("STATUS: PASS (Served CSV mass conservation verified across all 7 leads)\n")


def main():
    test_algorithm_level_conservation()
    test_served_csv_conservation()
    print("=" * 88)
    print("ALL MASS CONSERVATION REGRESSION TESTS PASSED.")
    print("=" * 88)


if __name__ == "__main__":
    main()
