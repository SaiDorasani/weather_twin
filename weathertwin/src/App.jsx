import { use, useEffect, useState } from "react";
import "./App.css";
import { runSimulation } from "./weatherSimulation";
import { Cloud } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

function App() {
  const [time, setTime] = useState(new Date());
  const [startSim, setStartSim] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const chartData = result
    ? Object.entries(result.hourlyComfortScore).map(([time, scores]) => ({
        time: time.slice(11, 16),
        ...scores,
      }))
    : [];

  return (
    <>
      <div className="app-weather-twin">
        <div className="app-header-row">
          <div className="icon-circle">
            <Cloud size={24} color="white" strokeWidth={3} />
          </div>
          <h1>Weather Twin</h1>
        </div>

        <div className="app-date-time-row">
          <p>
            {time.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p>
            {time.toLocaleDateString([], {
              month: "short",
              day: "numeric",
              weekday: "long",
            })}
          </p>
        </div>

        <div className="app-simulation-row">
          <h1> Personal Weather Simulation </h1>
          <p>Find the best clothing for today's weather.</p>

          {!startSim ? (
            <div className="simulation-idle-state">
              <button
                onClick={async () => {
                  const data = await runSimulation();
                  setResult(data);
                  setStartSim(true);

                  console.log(data);
                }}
                className="simulation-button"
              >
                Start Simulation
              </button>
            </div>
          ) : (
            <div className="simulation-results-state">
              {result?.bestLayer === "light_jacket" && (
                <div>
                  <h2>Best Clothing: Light Jacket </h2>
                  <img
                    src={`/${result.bestLayer}.svg`}
                    alt={result.bestLayer}
                    className="clothing-image"
                  />
                </div>
              )}
              {result?.bestLayer === "winter_coat" && (
                <div>
                  <h2>Best Clothing: Winter Coat </h2>
                  <img
                    src={`/${result.bestLayer}.svg`}
                    alt={result.bestLayer}
                    className="clothing-image"
                  />
                </div>
              )}
              {result?.bestLayer === "hoodie" && (
                <div>
                  <h2>Best Clothing: Hoodie </h2>
                  <img
                    src={`/${result.bestLayer}.svg`}
                    alt={result.bestLayer}
                    className="clothing-image"
                  />
                </div>
              )}
              {result && (
                <div className="simulation-graph">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis dataKey="time" />
                      <YAxis />

                      <Tooltip />
                      <Legend />

                      <ReferenceLine y={0} stroke="gray" />

                      <Line dataKey="hoodie" stroke="#3b82f6" />
                      <Line dataKey="light_jacket" stroke="#22c55e" />
                      <Line dataKey="winter_coat" stroke="#f97316" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              <button
                onClick={() => setStartSim(false)}
                className="simulation-button"
              >
                Finish simulation
              </button>
            </div>
          )}
        </div>
        <a
          className="simulation-button-answer"
          href="https://docs.google.com/forms/d/e/1FAIpQLSdVOHUQErNbH4VBfEj1Xnpq8kJSgRq4HIsaJ50HFMT3P_lWuQ/viewform?usp=sharing&ouid=106686610103450159618"
          target="_blank"
          rel="noopener noreferrer"
        >
          Today
        </a>
      </div>
    </>
  );
}

export default App;
