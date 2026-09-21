import React, { useState } from "react";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Eye,
  Snowflake,
  Sun,
  Thermometer,
  Umbrella,
  Wind,
  Clock,
  ChevronRight,
  Sparkles,
  Sliders,
  MapPin,
  Database,
  ExternalLink,
} from "lucide-react";
import { DayMoments, HourlyWeatherPoint, UserProfile } from "../types";
import { getThermalSensitivityLabel } from "../services/storageService";

interface WeatherDashboardProps {
  weather: DayMoments;
  hourly: HourlyWeatherPoint[];
  profile: UserProfile;
  dateStr: string;
  onOpenLocationModal?: () => void;
}

export const WeatherDashboard: React.FC<WeatherDashboardProps> = ({
  weather,
  hourly,
  profile,
  dateStr,
  onOpenLocationModal,
}) => {
  const [showAllHours, setShowAllHours] = useState(false);

  // Modificateur de sensibilité
  const modifier = profile.thermalSensitivity * 1.5;
  const morningEffective = Math.round((weather.morning.apparentTemp - modifier) * 10) / 10;
  const afternoonEffective = Math.round((weather.afternoon.apparentTemp - modifier) * 10) / 10;
  const eveningEffective = Math.round((weather.evening.apparentTemp - modifier) * 10) / 10;

  const thermalInfo = getThermalSensitivityLabel(profile.thermalSensitivity);

  const renderWeatherIcon = (name: string, className = "w-5 h-5") => {
    switch (name) {
      case "Sun":
        return <Sun className={`${className} text-amber-500`} />;
      case "CloudSun":
        return <CloudSun className={`${className} text-amber-500`} />;
      case "CloudRain":
        return <CloudRain className={`${className} text-blue-500`} />;
      case "CloudDrizzle":
        return <CloudDrizzle className={`${className} text-sky-400`} />;
      case "CloudFog":
        return <CloudFog className={`${className} text-slate-400`} />;
      case "CloudLightning":
        return <CloudLightning className={`${className} text-purple-500`} />;
      case "Snowflake":
        return <Snowflake className={`${className} text-cyan-400`} />;
      case "Cloud":
      default:
        return <Cloud className={`${className} text-slate-400`} />;
    }
  };

  const getFamilyWeatherTip = () => {
    if (profile.type === "Enfant") {
      if ((profile.childAge ?? 3) <= 2) {
        return {
          badge: "👶 Conseil Tout-petit & Poussette",
          text: `En poussette le matin, ${profile.name} ne produit pas de chaleur en marchant : le vent accentue vite le froid. Pensez au body doux en coton, aux petits chaussons chauds et à la chancelière protectrice.`,
          bg: "bg-purple-50/80 border-purple-200 text-purple-950",
          badgeBg: "bg-purple-200/70 text-purple-900 border-purple-300",
        };
      }
      if ((profile.childAge ?? 3) <= 5) {
        return {
          badge: "🎒 Conseil Maternelle & Récréation",
          text: `Il fait plus frais le matin sur le chemin de l'école qu'à 14h dans la cour de récréation. Prévoyez une veste zippée facile à ouvrir tout seul, et des baskets à scratchs pour encourager son autonomie !`,
          bg: "bg-emerald-50/80 border-emerald-200 text-emerald-950",
          badgeBg: "bg-emerald-200/70 text-emerald-900 border-emerald-300",
        };
      }
      return {
        badge: "🧒 Conseil École & Activités",
        text: `Avec un pic à ${weather.maxTemp}°C l'après-midi, ${profile.name} aura vite chaud en courant avec ses camarades. Une tenue superposée (T-shirt respirant + sweat amovible) est idéale pour la journée.`,
        bg: "bg-amber-50/80 border-amber-200 text-amber-950",
        badgeBg: "bg-amber-200/70 text-amber-900 border-amber-300",
      };
    }

    if (profile.defaultWorkEquipment?.safetyShoes) {
      return {
        badge: "🥾 Conseil Sécurité & Terrain",
        text: `Par temps frais, les coques de sécurité en métal créent un pont thermique vers les orteils. Privilégiez des chaussettes épaisses et une veste multipoches pour les écarts de température.`,
        bg: "bg-amber-50/80 border-amber-200 text-amber-950",
        badgeBg: "bg-amber-200/70 text-amber-900 border-amber-300",
      };
    }

    return {
      badge: "👟 Conseil Journée Parents & Travail",
      text: `Une amplitude thermique de ${Math.round(weather.maxTemp - weather.morning.temp)}°C entre le départ et l'après-midi : optez pour une veste légère sur un T-shirt casual ou une chemise confortable.`,
      bg: "bg-sky-50/80 border-sky-200 text-sky-950",
      badgeBg: "bg-sky-200/70 text-sky-900 border-sky-300",
    };
  };

  const familyTip = getFamilyWeatherTip();

  return (
    <div className="bg-white rounded-3xl border border-amber-200/80 p-6 shadow-xs mb-6 relative">
      {/* Header with City & Key Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-amber-100/80 gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300">
              ☀️ Météo Famille de Demain
            </span>
            <span className="text-xs text-slate-500 font-medium">Demain, {dateStr}</span>
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100/90 px-2 py-0.5 rounded-md border border-slate-200 inline-flex items-center gap-1">
              <Database className="w-3 h-3 text-amber-600" />
              Source : Open-Meteo
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <h2 className="text-lg font-bold text-slate-900 font-heading">
              {profile.location.name} — {weather.summary}
            </h2>
            {onOpenLocationModal && (
              <button
                onClick={onOpenLocationModal}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg border border-amber-300 transition-colors cursor-pointer"
                title="Changer uniquement la ville météo"
              >
                <MapPin className="w-3 h-3 text-rose-500" />
                <span>Changer de ville</span>
              </button>
            )}
          </div>
        </div>

        {/* Aggregate Badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs font-semibold text-slate-800">
            <Thermometer className="w-3.5 h-3.5 text-rose-500" />
            <span>
              {weather.minTemp}°C min / {weather.maxTemp}°C max
            </span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              weather.maxRainProb >= 40
                ? "bg-blue-50 text-blue-900 border-blue-300"
                : "bg-slate-50 text-slate-700 border-slate-200"
            }`}
          >
            <Umbrella className="w-3.5 h-3.5 text-blue-500" />
            <span>Pluie max : {weather.maxRainProb}%</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
            <Wind className="w-3.5 h-3.5 text-slate-500" />
            <span>Vent : {Math.round(weather.maxWindSpeed)} km/h</span>
          </div>

          {weather.maxUvIndex >= 3 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold">
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              <span>Indice UV : {weather.maxUvIndex}/11</span>
            </div>
          )}
        </div>
      </div>

      {/* Bannière Conseil Météo & Confort Famille */}
      <div className={`mt-4 p-4 rounded-2xl border flex items-start gap-3.5 ${familyTip.bg}`}>
        <div className="p-2 rounded-xl bg-white shadow-2xs shrink-0 text-amber-600">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${familyTip.badgeBg}`}>
              {familyTip.badge}
            </span>
            <span className="text-xs font-bold text-slate-800">
              Anticipation météo pour {profile.name}
            </span>
          </div>
          <p className="text-xs leading-relaxed opacity-95">
            {familyTip.text}
          </p>
        </div>
      </div>

      {/* 3 Key Moments Cards */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 font-heading">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Les 3 moments clés de la journée de {profile.name}
          </span>
          <div className="text-[11px] text-slate-600 flex items-center gap-1">
            <Sliders className="w-3 h-3 text-amber-600" />
            Sensibilité au froid : <span className="font-bold text-slate-800">{thermalInfo.badge}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* 1. Matin - Trajet Aller */}
          <div className="p-4 rounded-2xl border border-sky-200 bg-sky-50/50 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide font-heading">
                  Matin (Départ École / Travail)
                </span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-sky-200 text-sky-900 shadow-2xs">
                ~ 08h00
              </span>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-3">
                {renderWeatherIcon(weather.morning.iconName, "w-8 h-8")}
                <div>
                  <div className="text-2xl font-bold text-slate-900 tracking-tight font-heading">
                    {weather.morning.temp}°C
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Ressenti brut {weather.morning.apparentTemp}°C
                  </div>
                </div>
              </div>

              {/* Effective felt with user thermal modifier */}
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-amber-900 tracking-wider">
                  Ressenti {profile.name}
                </div>
                <div className="text-base font-extrabold text-amber-950 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 inline-block">
                  {morningEffective}°C
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-sky-200/80 flex items-center justify-between text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1">
                <Umbrella className="w-3 h-3 text-blue-500" />
                Pluie : {weather.morning.precipitationProb}%
              </span>
              <span className="flex items-center gap-1">
                <Wind className="w-3 h-3 text-slate-400" />
                Vent : {weather.morning.windSpeed} km/h
              </span>
            </div>
          </div>

          {/* 2. Après-midi - Pic Thermique */}
          <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide font-heading">
                  Après-midi (Récré &amp; Activités)
                </span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-amber-200 text-amber-900 shadow-2xs">
                ~ 14h00
              </span>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-3">
                {renderWeatherIcon(weather.afternoon.iconName, "w-8 h-8")}
                <div>
                  <div className="text-2xl font-bold text-slate-900 tracking-tight font-heading">
                    {weather.afternoon.temp}°C
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Ressenti brut {weather.afternoon.apparentTemp}°C
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-amber-900 tracking-wider">
                  Ressenti {profile.name}
                </div>
                <div className="text-base font-extrabold text-amber-950 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 inline-block">
                  {afternoonEffective}°C
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-amber-200/80 flex items-center justify-between text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1">
                <Umbrella className="w-3 h-3 text-blue-500" />
                Pluie : {weather.afternoon.precipitationProb}%
              </span>
              <span className="flex items-center gap-1">
                <Sun className="w-3 h-3 text-amber-500" />
                UV : {weather.afternoon.uvIndex}/11
              </span>
            </div>
          </div>

          {/* 3. Soir - Trajet Retour */}
          <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/40 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide font-heading">
                  Soir (Sortie d'école &amp; Retour)
                </span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-purple-200 text-purple-900 shadow-2xs">
                ~ 18h00
              </span>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-3">
                {renderWeatherIcon(weather.evening.iconName, "w-8 h-8")}
                <div>
                  <div className="text-2xl font-bold text-slate-900 tracking-tight font-heading">
                    {weather.evening.temp}°C
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Ressenti brut {weather.evening.apparentTemp}°C
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-amber-900 tracking-wider">
                  Ressenti {profile.name}
                </div>
                <div className="text-base font-extrabold text-amber-950 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 inline-block">
                  {eveningEffective}°C
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-purple-200/80 flex items-center justify-between text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1">
                <Umbrella className="w-3 h-3 text-blue-500" />
                Pluie : {weather.evening.precipitationProb}%
              </span>
              <span className="flex items-center gap-1">
                <Wind className="w-3 h-3 text-slate-400" />
                Vent : {weather.evening.windSpeed} km/h
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Timeline (Ribbon) */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Évolution continue (24 heures)
          </span>
          <button
            onClick={() => setShowAllHours(!showAllHours)}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>{showAllHours ? "Mode condensé" : "Voir toute la journée"}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto pb-2 -mx-1 px-1">
          <div className="flex items-center gap-2 min-w-max">
            {hourly
              .filter((h) => (showAllHours ? true : h.hour >= 6 && h.hour <= 22))
              .map((h) => {
                const isCommute = h.hour === 8 || h.hour === 18;
                const isPeak = h.hour === 14;

                return (
                  <div
                    key={h.time}
                    className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
                      isCommute
                        ? "bg-sky-50 border-sky-300 ring-1 ring-sky-200"
                        : isPeak
                        ? "bg-amber-50 border-amber-300 ring-1 ring-amber-200"
                        : "bg-slate-50/80 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-[11px] font-semibold text-slate-600">
                      {h.hour}h
                    </span>
                    <div className="my-1.5">{renderWeatherIcon(h.iconName, "w-4 h-4")}</div>
                    <span className="text-xs font-bold text-slate-900">{h.temp}°</span>
                    <div
                      className={`text-[10px] font-medium mt-1 px-1.5 py-0.2 rounded ${
                        h.precipitationProb >= 30
                          ? "bg-blue-100 text-blue-800 font-bold"
                          : "text-slate-400"
                      }`}
                    >
                      {h.precipitationProb}%
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Weather Data Source Attribution */}
      <div className="mt-4 pt-3 border-t border-amber-100/90 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-amber-600" />
            Source des données météo :
          </span>
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-800 hover:text-amber-950 font-bold underline decoration-amber-300 hover:decoration-amber-500 inline-flex items-center gap-1 transition-colors"
            title="Consulter le service météo Open-Meteo"
          >
            <span>Open-Meteo API</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600">
            Modèles météorologiques haute résolution (Météo-France AROME/ARPEGE, DWD ICON, ECMWF)
          </span>
        </div>
        <div className="text-[10px] text-slate-400 font-medium shrink-0">
          Actualisation continue • Prévisions à 24h
        </div>
      </div>
    </div>
  );
};
