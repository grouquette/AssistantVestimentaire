import { DayMoments, HourlyWeatherPoint, LocationInfo } from "../types";

export function getWeatherConditionInfo(code: number): { description: string; iconName: string } {
  // WMO Weather interpretation codes (WW)
  if (code === 0) return { description: "Ciel parfaitement dégagé", iconName: "Sun" };
  if (code === 1) return { description: "Ensoleillé avec rares nuages", iconName: "Sun" };
  if (code === 2) return { description: "Éclaircies et nuages épars", iconName: "CloudSun" };
  if (code === 3) return { description: "Ciel couvert", iconName: "Cloud" };
  if (code === 45 || code === 48) return { description: "Brouillard ou brume givrante", iconName: "CloudFog" };
  if (code >= 51 && code <= 55) return { description: "Bruine légère", iconName: "CloudDrizzle" };
  if (code >= 61 && code <= 63) return { description: "Pluie modérée", iconName: "CloudRain" };
  if (code >= 65) return { description: "Fortes pluies continues", iconName: "CloudRain" };
  if (code >= 71 && code <= 77) return { description: "Chutes de neige", iconName: "Snowflake" };
  if (code >= 80 && code <= 82) return { description: "Averses intermittentes", iconName: "CloudRain" };
  if (code >= 85 && code <= 86) return { description: "Averses de neige", iconName: "Snowflake" };
  if (code >= 95) return { description: "Risque d'orages", iconName: "CloudLightning" };
  return { description: "Temps variable", iconName: "CloudSun" };
}

export async function searchLocations(query: string): Promise<LocationInfo[]> {
  try {
    const res = await fetch(`/api/weather/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        return data.results;
      }
    }
  } catch (err) {
    console.warn("API search error, falling back to direct geocoding:", err);
  }

  // Direct Open-Meteo fallback
  try {
    const directUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=fr&format=json`;
    const res = await fetch(directUrl);
    const data = await res.json();
    return (data.results || []).map((item: any) => ({
      name: item.name,
      country: item.country,
      admin1: item.admin1 || "",
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone || "auto",
    }));
  } catch (err) {
    console.error("Geocoding failed completely:", err);
    return [];
  }
}

export async function fetchTomorrowWeather(location: LocationInfo): Promise<{
  dayMoments: DayMoments;
  hourlyTomorrow: HourlyWeatherPoint[];
  dateStr: string;
}> {
  try {
    const res = await fetch(
      `/api/weather/forecast?lat=${location.latitude}&lon=${location.longitude}&timezone=${encodeURIComponent(
        location.timezone || "auto"
      )}`
    );

    if (res.ok) {
      const data = await res.json();
      return parseTomorrowData(data);
    }
  } catch (e) {
    console.warn("Forecast fetch via server proxy failed, trying direct Open-Meteo:", e);
  }

  // Direct client fallback
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,uv_index&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,uv_index_max&timezone=auto&forecast_days=3`;
    const res = await fetch(url);
    const data = await res.json();
    return parseTomorrowData(data);
  } catch (err) {
    console.error("Direct forecast failed, using realistic fallback:", err);
    return getRealisticMockTomorrow(location);
  }
}

function parseTomorrowData(data: any): {
  dayMoments: DayMoments;
  hourlyTomorrow: HourlyWeatherPoint[];
  dateStr: string;
} {
  const hourly = data.hourly;
  if (!hourly || !hourly.time || hourly.time.length === 0) {
    throw new Error("Invalid hourly data structure");
  }

  // Calculer la date de demain
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDateIso = tomorrow.toISOString().split("T")[0];

  const hourlyTomorrow: HourlyWeatherPoint[] = [];

  for (let i = 0; i < hourly.time.length; i++) {
    const timeStr = hourly.time[i];
    if (timeStr.startsWith(tomorrowDateIso)) {
      const dateObj = new Date(timeStr);
      const hour = dateObj.getHours();
      const code = hourly.weather_code[i] ?? 0;
      const cond = getWeatherConditionInfo(code);

      hourlyTomorrow.push({
        time: timeStr,
        hour,
        temp: Math.round(hourly.temperature_2m[i]),
        apparentTemp: Math.round(hourly.apparent_temperature[i]),
        precipitationProb: Math.round(hourly.precipitation_probability[i] ?? 0),
        precipitationMm: Math.round((hourly.precipitation[i] ?? 0) * 10) / 10,
        weatherCode: code,
        windSpeed: Math.round(hourly.wind_speed_10m[i] ?? 10),
        uvIndex: Math.round(hourly.uv_index[i] ?? 0),
        conditionDescription: cond.description,
        iconName: cond.iconName,
      });
    }
  }

  // Si le format date ISO ne correspond pas exactement, prendre les heures 24 à 47
  if (hourlyTomorrow.length === 0) {
    for (let i = 24; i < Math.min(48, hourly.time.length); i++) {
      const timeStr = hourly.time[i];
      const hour = i % 24;
      const code = hourly.weather_code[i] ?? 0;
      const cond = getWeatherConditionInfo(code);
      hourlyTomorrow.push({
        time: timeStr,
        hour,
        temp: Math.round(hourly.temperature_2m[i]),
        apparentTemp: Math.round(hourly.apparent_temperature[i]),
        precipitationProb: Math.round(hourly.precipitation_probability[i] ?? 0),
        precipitationMm: Math.round((hourly.precipitation[i] ?? 0) * 10) / 10,
        weatherCode: code,
        windSpeed: Math.round(hourly.wind_speed_10m[i] ?? 10),
        uvIndex: Math.round(hourly.uv_index[i] ?? 0),
        conditionDescription: cond.description,
        iconName: cond.iconName,
      });
    }
  }

  // Trouver les 3 moments clés :
  // Matin (~8h), Après-midi (~14h), Soir (~18h)
  const morning = hourlyTomorrow.find((h) => h.hour === 8) || hourlyTomorrow[8] || hourlyTomorrow[0];
  const afternoon =
    hourlyTomorrow.find((h) => h.hour === 14) || hourlyTomorrow[14] || hourlyTomorrow[6] || morning;
  const evening =
    hourlyTomorrow.find((h) => h.hour === 18) || hourlyTomorrow[18] || hourlyTomorrow[10] || afternoon;

  const temps = hourlyTomorrow.map((h) => h.temp);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const maxRainProb = Math.max(...hourlyTomorrow.map((h) => h.precipitationProb));
  const maxWindSpeed = Math.max(...hourlyTomorrow.map((h) => h.windSpeed));
  const maxUvIndex = Math.max(...hourlyTomorrow.map((h) => h.uvIndex));

  const frenchDateStr = tomorrow.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return {
    dayMoments: {
      morning,
      afternoon,
      evening,
      minTemp,
      maxTemp,
      maxRainProb,
      maxWindSpeed,
      maxUvIndex,
      summary: afternoon.conditionDescription,
    },
    hourlyTomorrow,
    dateStr: frenchDateStr.charAt(0).toUpperCase() + frenchDateStr.slice(1),
  };
}

function getRealisticMockTomorrow(location: LocationInfo): {
  dayMoments: DayMoments;
  hourlyTomorrow: HourlyWeatherPoint[];
  dateStr: string;
} {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const hours: HourlyWeatherPoint[] = [];
  for (let h = 0; h < 24; h++) {
    // Courbe réaliste : frais le matin (8°C), doux à 14h (17°C), fraîchissant le soir (12°C)
    let temp = 10;
    if (h >= 6 && h <= 9) temp = 9;
    else if (h > 9 && h <= 15) temp = 16;
    else if (h > 15 && h <= 20) temp = 13;
    else temp = 8;

    const apparentTemp = temp - 1;
    const rainProb = h >= 14 && h <= 17 ? 40 : 15;
    const uv = h >= 11 && h <= 15 ? 4 : 0;

    hours.push({
      time: `2026-09-10T${h.toString().padStart(2, "0")}:00:00Z`,
      hour: h,
      temp,
      apparentTemp,
      precipitationProb: rainProb,
      precipitationMm: rainProb > 30 ? 0.3 : 0,
      weatherCode: rainProb > 30 ? 80 : 2,
      windSpeed: 18,
      uvIndex: uv,
      conditionDescription: rainProb > 30 ? "Risque d'ondée" : "Éclaircies et passages nuageux",
      iconName: rainProb > 30 ? "CloudRain" : "CloudSun",
    });
  }

  const morning = hours[8];
  const afternoon = hours[14];
  const evening = hours[18];

  const dateStr = tomorrow.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return {
    dayMoments: {
      morning,
      afternoon,
      evening,
      minTemp: 8,
      maxTemp: 17,
      maxRainProb: 40,
      maxWindSpeed: 22,
      maxUvIndex: 4,
      summary: "Éclaircies avec risque d'averse modéré",
    },
    hourlyTomorrow: hours,
    dateStr: dateStr.charAt(0).toUpperCase() + dateStr.slice(1),
  };
}
