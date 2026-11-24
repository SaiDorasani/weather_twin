export async function getWeather() {
  const url = "https://api.open-meteo.com/v1/forecast";

  const params = new URLSearchParams({
    latitude: "40.1164",
    longitude: "-88.2434",
    hourly: "temperature_2m",
    temperature_unit: "fahrenheit",
    timezone: "America/Chicago",
    forecast_days: "1",
  });

  const response = await fetch(`${url}?${params}`);

  if (!response.ok) {
    throw new Error("Failed to fetch weather");
  }

  const data = await response.json();

  const temps = data.hourly.temperature_2m;
  const times = data.hourly.time;

  return { temps, times };
}

// comfort model
export function comfort_model(T_outside, T_preferred) {
  // warming effect from clothing (adding layers)
  const I_hoodie = 20; // preferred 75 - 20 = @ 55 degrees
  const I_light_jacket = 30;
  const I_winter_coat = 45;

  const comfort_score_hoodie = T_outside - T_preferred + I_hoodie;
  const comfort_score_light_jacket = T_outside - T_preferred + I_light_jacket;
  const comfort_score_winter_coat = T_outside - T_preferred + I_winter_coat;

  // Comfort the closer to 0 the better (+ 1 too hot and - 1 too cold)
  const comfort_scores = {
    hoodie: comfort_score_hoodie,
    light_jacket: comfort_score_light_jacket,
    winter_coat: comfort_score_winter_coat,
  };

  return comfort_scores;
}

export async function runSimulation() {
  // get variables form getWeather
  const { temps, times } = await getWeather();
  const TPreferred = 75;

  console.log(temps);
  console.log(times);

  const hourlyComfortScore = {};

  for (let i = 0; i < Math.min(times.length, temps.length); i++) {
    const time = times[i];
    const temp = temps[i];
    const hour = Number(time.slice(11, 13));
    if (hour >= 9 && hour <= 18) {
      const TOutside = temp;

      const scores = comfort_model(TOutside, TPreferred);
      hourlyComfortScore[time] = scores;
      console.log("hourly_comfort_score: ", time, hourlyComfortScore[time]);
    }
  }

  const averageScores = {};

  // Find average of each layer
  for (const clothing of ["hoodie", "light_jacket", "winter_coat"]) {
    let total = 0;

    for (const time in hourlyComfortScore) {
      total += Math.abs(hourlyComfortScore[time][clothing]);
    }

    averageScores[clothing] = total / Object.keys(hourlyComfortScore).length;
  }

  // Now find the best (min) of the three layers
  const bestLayer = Object.keys(averageScores).reduce((a, b) =>
    averageScores[a] <= averageScores[b] ? a : b,
  );

  console.log("Best clothing: ", bestLayer);
  console.log("Best Average: ", averageScores[bestLayer]);

  return {
    bestLayer,
    averageScores,
    hourlyComfortScore,
  };
}
