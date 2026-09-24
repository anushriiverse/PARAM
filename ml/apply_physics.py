import sys
from pathlib import Path

import numpy as np
import pandas as pd

# --------------------------------------------------
# Project path
# --------------------------------------------------

REPO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO))

INPUT_FILE = REPO / "data" / "processed" / "training_dataset_with_elevation.csv"
OUTPUT_FILE = REPO / "data" / "processed" / "training_dataset_with_physics.csv"


# --------------------------------------------------
# Load data
# --------------------------------------------------

df = pd.read_csv(INPUT_FILE)

print("Input shape:", df.shape)


# --------------------------------------------------
# Import physics engine
# --------------------------------------------------

from engine.deterministic.temperature import downscale_temperature
from engine.deterministic.humidity import downscale_humidity


# --------------------------------------------------
# Prepare inputs
# --------------------------------------------------

coarse_temp = df["era5_temperature"].to_numpy() + 273.15
coarse_dewpoint = df["era5_dewpoint_temperature"].to_numpy() + 273.15

coarse_elevation = df["era5_elevation_m"].to_numpy()
fine_elevation = df["station_elevation_m"].to_numpy()


# --------------------------------------------------
# Temperature downscaling
# --------------------------------------------------

df["physics_temperature"] = downscale_temperature(
    coarse_temp=coarse_temp,
    coarse_elev=coarse_elevation,
    fine_elev=fine_elevation,
    lapse_rate=6.5,
)


# --------------------------------------------------
# Humidity downscaling
# --------------------------------------------------

physics_rh, humidity_clamp = downscale_humidity(
    t2m_coarse=coarse_temp,
    d2m_coarse=coarse_dewpoint,
    dem_fine=fine_elevation,
    dem_coarse=coarse_elevation,
)

df["physics_relative_humidity"] = np.asarray(physics_rh)
df["humidity_clamp_flag"] = np.asarray(humidity_clamp)


# --------------------------------------------------
# Check results
# --------------------------------------------------

print("\nPhysics temperature:")
print(df["physics_temperature"].describe())

print("\nPhysics relative humidity:")
print(df["physics_relative_humidity"].describe())

print("\nHumidity clamp count:")
print(df["humidity_clamp_flag"].sum())


# --------------------------------------------------
# Save
# --------------------------------------------------

df.to_csv(OUTPUT_FILE, index=False)

print("\nOutput shape:", df.shape)
print(f"Saved to: {OUTPUT_FILE}")