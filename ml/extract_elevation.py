import ee
import pandas as pd
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
OUT_FILE = REPO / "data" / "processed"/ "station_elevation.csv"

# initialize earth engine
ee.Authenticate()
ee.Initialize(project="alien-cedar-483108-h3")

STATIONS = [
    {"id": "BHATSANAGAR_1", "name": "Bhatsanagar_1", "lat": 19.5195, "lon": 73.4093},
    {"id": "SUKSALE", "name": "Suksale", "lat": 19.7994, "lon": 73.1178},
    {"id": "PAUD_1", "name": "Paud_1", "lat": 18.5335, "lon": 73.6072},
    {"id": "SONGE_BANGE", "name": "Songe_Bange", "lat": 16.4200, "lon": 74.2600},
    {"id": "JALNA_2", "name": "Jalna_2", "lat": 19.8333, "lon": 75.8000},
    {"id": "YELDARI_DAM_1", "name": "Yeldari dam_1", "lat": 19.7153, "lon": 76.7208},
]

# Datasets

srtm = ee.Image("USGS/SRTMGL1_003")

era5 = (
    ee.ImageCollection("ECMWF/ERA5/HOURLY").select("geopotential").first())

#extract elevation for each station
results = []
for station in STATIONS:
    point = ee.Geometry.Point([station["lon"], station["lat"]])
    station_elevation = srtm.reduceRegion(
        reducer=ee.Reducer.first(),
        geometry=point,
        scale=30,

    ).get("elevation")
    geopotential = era5.reduceRegion(
        reducer=ee.Reducer.first(),
        geometry=point,
        scale=28000,
    ).get("geopotential")

    values = ee.Dictionary({
        "station_elevation_m": station_elevation,
        "era5_geopotential": geopotential,
    }).getInfo()

    era5_elevation = (
        values["era5_geopotential"] / 9.80665 if values["era5_geopotential"] is not None else None
    )

    results.append({
         "station_id": station["id"],
        "station": station["name"],
        "latitude": station["lat"],
        "longitude": station["lon"],
        "station_elevation_m": values["station_elevation_m"],
        "era5_elevation_m": era5_elevation,
        "elevation_difference_m": (
            values["station_elevation_m"] - era5_elevation
            if era5_elevation is not None
            else None
        )
    })

# save

df = pd.DataFrame(results)

OUT_FILE.parent.mkdir(parents=True, exist_ok=True)

df.to_csv(OUT_FILE, index=False)

print("\nElevation data extraction complete")
print(df.to_string(index=False))
print(f"\nSaved to: {OUT_FILE}")