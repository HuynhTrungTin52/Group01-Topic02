// Open-Meteo weather service — keyless public API.
// Docs: https://open-meteo.com/en/docs

export const WEATHER_CODES = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail",
};

export const describeCode = (c) =>
  (c != null && WEATHER_CODES[c]) || "Unknown";

// Ho Chi Minh City coordinates
const CITY = {
  name: "Ho Chi Minh - City",
  latitude: 10.82,
  longitude: 106.63,
  timezone: "Asia/Ho_Chi_Minh",
};

/**
 * Fetches current weather for Ho Chi Minh City from Open-Meteo.
 * Returns { city, time (HH:MM local), tempC, code, description }.
 */
export const fetchWeather = async () => {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", CITY.latitude);
  url.searchParams.set("longitude", CITY.longitude);
  url.searchParams.set("current", "temperature_2m,weather_code");
  url.searchParams.set("timezone", CITY.timezone);
  url.searchParams.set("temperature_unit", "celsius");

  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);
  const data = await res.json();
  const cur = data.current || {};

  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: CITY.timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false 
  });
  
  const liveTime = formatter.format(now);

  const code = cur.weather_code;
  return {
    city: CITY.name,
    time: liveTime, 
    tempC: typeof cur.temperature_2m === "number" ? cur.temperature_2m : null,
    code,
    description: describeCode(code),
  };
};

export const CITY_INFO = CITY;
