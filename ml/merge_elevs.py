import pandas as pd
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent

TRAINING_FILE = REPO / "data" / "processed" / "training_dataset.csv"
ELEVATION_FILE = REPO / "data" / "processed" / "station_elevation.csv"
OUTPUT_FILE = REPO / "data" / "processed" / "training_dataset_with_elevation.csv"


# Load
training = pd.read_csv(TRAINING_FILE)
elevation = pd.read_csv(ELEVATION_FILE)

print("Training dataset:", training.shape)
print("Elevation dataset:", elevation.shape)


# Check station IDs
print("\nTraining station IDs:")
print(training["station_id"].unique())

print("\nElevation station IDs:")
print(elevation["station_id"].unique())


# Keep only required elevation columns
elevation = elevation[
    [
        "station_id",
        "station_elevation_m",
        "era5_elevation_m",
        "elevation_difference_m",
    ]
]


# One elevation record per station
assert elevation["station_id"].is_unique


# Merge
merged = training.merge(
    elevation,
    on="station_id",
    how="left",
    validate="many_to_one",
)


# Checks
print("\nMerged dataset:", merged.shape)

print("\nMissing elevation values:")
print(
    merged[
        [
            "station_elevation_m",
            "era5_elevation_m",
            "elevation_difference_m",
        ]
    ].isna().sum()
)

print("\nElevation values:")
print(
    merged[
        [
            "station_id",
            "station_elevation_m",
            "era5_elevation_m",
            "elevation_difference_m",
        ]
    ].drop_duplicates().to_string(index=False)
)


# Save
merged.to_csv(OUTPUT_FILE, index=False)

print(f"\nSaved to: {OUTPUT_FILE}")