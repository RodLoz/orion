export function skillManifest(id = "weather-reader") {
  return {
    id,
    name: "Weather reader",
    version: "1.0.0",
    description: "Reads prepared weather metadata.",
    author: "ORION",
    license: "MIT",
    permissions: ["weather.read"],
    capabilities: ["weather.read", "forecast.read"],
    events: { publishes: ["WeatherRead"], consumes: ["LocationSelected"] },
    inputs: ["location.value"],
    outputs: ["weather.value"],
    failureModes: ["weather.unavailable"],
  };
}
