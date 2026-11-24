import requests
from datetime import datetime

url = "https://api.open-meteo.com/v1/forecast"
params = {
    "latitude": 40.1164,
    "longitude": -88.2434,
    "current": "temperature_2m,relative_humidity_2m",
    "hourly": ["temperature_2m", "precipitation_probability"],
    "daily": ["temperature_2m_max", "temperature_2m_min"],
    "temperature_unit": "fahrenheit",
    "timezone": "America/Chicago",
    "start_date": "2026-11-22",
    "end_date": "2026-11-22"
}


response = requests.get(url, params=params, timeout=10)
response.raise_for_status()
data = response.json()

temps = data["hourly"]["temperature_2m"]
times = data["hourly"]["time"]


T_time = 0
T_outside = data["current"]["temperature_2m"]
T_preferred = 75 # temp where I don't need any layers

# comfort model
def comfort_model(T_outside, T_preferred):
    # warming effect from clothing (adding layers)
    I_hoodie = 20 # preferred 75 - 20 = @ 55 degrees 
    I_light_jacket = 30
    I_winter_coat = 45

    comfort_score_hoodie = T_outside - T_preferred + I_hoodie
    comfort_score_light_jacket = T_outside - T_preferred + I_light_jacket
    comfort_score_winter_coat = T_outside - T_preferred + I_winter_coat

    # Comfort the closer to 0 the better (+ 1 too hot and - 1 too cold)
    comfort_scores = {
        "hoodie": comfort_score_hoodie,
        "light_jacket": comfort_score_light_jacket,
        "winter_coat": comfort_score_winter_coat
    }

    return comfort_scores

hourly_comfort_score = {}

for time, temp in zip(times, temps):
    hour = datetime.fromisoformat(time).hour
    if 9 <= hour <= 18:
        T_time = time
        T_outside = temp

        scores = comfort_model(T_outside, T_preferred)
        hourly_comfort_score[time] = scores
        print("hourly_comfort_score: ", time, hourly_comfort_score[time])

average_scores = {}

# Find average of each layers
for clothing in ["hoodie", "light_jacket", "winter_coat"]:
    total = 0

    for time in hourly_comfort_score:
        total += abs(hourly_comfort_score[time][clothing])

    average_scores[clothing] = total / len(hourly_comfort_score)

# Now find the best min out of the three layers
best_layer = min(average_scores, key=average_scores.get)

print("Best clothing: ", best_layer)
print("Best Average: ", average_scores[best_layer])