import pandas as pd
from pathlib import Path
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error
from xgboost import XGBRegressor

REPO = Path(__file__).resolve().parent.parent

DATA_PATH = REPO / "data" / "processed" / "ml_training_dataset.csv"

df = pd.read_csv(DATA_PATH)
df["datetime"] = pd.to_datetime(df["datetime"])

df["hour"] = df["datetime"].dt.hour
df["month"] = df["datetime"].dt.month
df["day_of_year"] = df["datetime"].dt.dayofyear

print("Dataset shape:", df.shape)
print("Stations:", df["station_id"].unique())

# Features used by the ML models
feature_cols = [
    "latitude",
    "longitude",
    "era5_temperature",
    "era5_dewpoint_temperature",
    "era5_u10",
    "era5_v10",
    "era5_relative_humidity",
    "era5_wind_speed",
    "era5_wind_direction",
    "station_elevation_m",
    "era5_elevation_m",
    "elevation_difference_m",
    "physics_temperature",
    "physics_relative_humidity",
    "physics_wind_speed",
    "humidity_clamp_flag",
    "hour",
    "month",
    "day_of_year",
]

# Targets: residuals that the ML model will learn
target_cols = {
    "temperature": "temperature_residual",
    "humidity": "humidity_residual",
    "wind": "wind_speed_residual",
}

# Stations for Leave-One-Station-Out validation
stations = df["station_id"].unique()

print("Number of features:", len(feature_cols))
print("Targets:", target_cols)
print("Number of stations:", len(stations))

# Train-test split for each station
all_results = []

for test_station in stations:
    print(f"\nTraining model for station: {test_station}")

    # Split the data into training and testing sets
    train_df = df[df["station_id"] != test_station].copy()
    test_df = df[df["station_id"] == test_station].copy()

    X_train = train_df[feature_cols]

    X_test = test_df[feature_cols]

    # train one model per variable
    for variable, target_col in target_cols.items():
        print(f"\nTraining model for variable: {variable}")

        y_train = train_df[target_col]
        y_test = test_df[target_col]

        # Train the model
        model = XGBRegressor(
            n_estimators=300,
            learning_rate=0.05,
            max_depth=6,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            objective="reg:squarederror",
            n_jobs=-1
        )
        model.fit(X_train, y_train)

        # Make predictions
        predict_residual = model.predict(X_test)

        # reconstruct final weather prediction

        if variable == "temperature":
            physics_col = "physics_temperature"
        elif variable == "humidity":
            physics_col = "physics_relative_humidity"
        elif variable == "wind":
            physics_col = "physics_wind_speed"

        physics_prediction = test_df[physics_col].values
        final_prediction = physics_prediction + predict_residual

        # actual observations
        if variable == "temperature":
            actual_observation = test_df["temperature_obs"].values
        elif variable == "humidity":
            actual_observation = test_df["humidity_obs"].values
        elif variable == "wind":
            actual_observation = test_df["wind_speed_obs"].values

        # Calculate metrics
        physics_mae = mean_absolute_error(actual_observation, physics_prediction)
        physics_rmse = np.sqrt(mean_squared_error(actual_observation, physics_prediction))
        ml_mae = mean_absolute_error(actual_observation, final_prediction)
        ml_rmse = np.sqrt(mean_squared_error(actual_observation, final_prediction))

        improvement = ((physics_mae - ml_mae) / physics_mae) * 100

        print(
            f"Physics MAE: {physics_mae:.4f} | "
            f"ML MAE: {ml_mae:.4f} | "
            f"Improvement: {improvement:.2f}%"
        )

        print(
            f"Physics RMSE: {physics_rmse:.4f} | "
            f"ML RMSE: {ml_rmse:.4f}"
        )

        all_results.append({
            "test_station": test_station,
            "variable": variable,
            "physics_mae": physics_mae,
            "ml_mae": ml_mae,
            "physics_rmse": physics_rmse,
            "ml_rmse": ml_rmse,
            "improvement_percent": improvement,
        })

# Save results to a DataFrame
results_df = pd.DataFrame(all_results)

print("\n")
print("=" * 80)
print("LOSO VALIDATION RESULTS")
print("=" * 80)

print(
    results_df[
        [
            "test_station",
            "variable",
            "physics_mae",
            "ml_mae",
            "physics_rmse",
            "ml_rmse",
            "improvement_percent",
        ]
    ].to_string(index=False)
)

# overall summary of results
print("AVERAGE RESULTS")

summary = (
    results_df
    .groupby("variable")
    .agg({
        "physics_mae": "mean",
        "ml_mae": "mean",
        "physics_rmse": "mean",
        "ml_rmse": "mean",
        "improvement_percent": "mean",
    })
)

print(summary)
       