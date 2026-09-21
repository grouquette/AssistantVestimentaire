import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// 1. Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 2. City geocoding search using Open-Meteo (free, no API key needed, high reliability)
app.get("/api/weather/search", async (req, res) => {
  const query = req.query.q as string;
  if (!query || query.trim().length < 2) {
    return res.json({ results: [] });
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=6&language=fr&format=json`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geocoding HTTP error: ${response.status}`);
    }
    const data = await response.json();
    const results = (data.results || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      country: item.country,
      admin1: item.admin1 || "",
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone || "auto",
    }));
    res.json({ results });
  } catch (error: any) {
    console.error("Geocoding error:", error);
    res.status(500).json({ error: "Failed to search location", message: error.message });
  }
});

// 3. Detailed hourly weather forecast for today & tomorrow
app.get("/api/weather/forecast", async (req, res) => {
  const lat = req.query.lat as string;
  const lon = req.query.lon as string;
  const timezone = (req.query.timezone as string) || "auto";

  if (!lat || !lon) {
    return res.status(400).json({ error: "Latitude and Longitude are required" });
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,uv_index&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,uv_index_max&timezone=${encodeURIComponent(timezone)}&forecast_days=3`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather HTTP error: ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Weather forecast error:", error);
    res.status(500).json({ error: "Failed to fetch weather forecast", message: error.message });
  }
});

// 4. Server-side Gemini AI Stylist analysis with multi-model fallback & smart fallback
function getDeterministicStylistSynthesis(
  profile: any,
  context: any,
  weatherDay: any,
  ruleRecommendation: any
) {
  const morningTemp = weatherDay?.morning?.apparentTemp ?? weatherDay?.morning?.temp ?? 12;
  const afternoonTemp = weatherDay?.afternoon?.apparentTemp ?? weatherDay?.afternoon?.temp ?? 18;
  const tempDiff = Math.abs(afternoonTemp - morningTemp);
  const rainProb = weatherDay?.maxRainProb ?? weatherDay?.morning?.precipitationProb ?? 0;
  const isChild = profile?.type === "Enfant";
  const name = profile?.name || "vous";
  const contextName = context?.name || "la journée";
  const formality = context?.formality || "décontractée";

  let summary = "";
  if (isChild) {
    const age = profile?.childAge ? ` (${profile.childAge} ans)` : "";
    summary = `Pour ${name}${age} en contexte "${contextName}", la tenue a été calibrée pour allier liberté de mouvement et confort thermique. Les fermetures et matières facilitent l'autonomie tout en protégeant bien du froid matinal.`;
  } else if (morningTemp < 10 && afternoonTemp >= 16) {
    summary = `Matinée fraîche (${Math.round(morningTemp)}°C ressenti) mais après-midi agréable (${Math.round(afternoonTemp)}°C) pour ${name}. La tenue recommandée adopte le principe de superposition pour rester élégant en style ${formality} dehors comme à l'intérieur.`;
  } else if (morningTemp < 8) {
    summary = `Conditions fraîches prévues demain pour ${name}. La veste ou le manteau de protection est essentiel le matin pour le trajet, tandis que la tenue intérieure reste légère et confortable une fois arrivé.`;
  } else {
    summary = `Tenue équilibrée et adaptée pour ${name} en contexte "${contextName}". Les pièces sélectionnées respectent le niveau d'exigence ${formality} et les températures douces annoncées.`;
  }

  let practicalTip = "";
  if (tempDiff >= 6) {
    practicalTip = `Écart thermique de ${Math.round(tempDiff)}°C entre matin et après-midi : portez votre veste fermée au départ, et déposez-la dès votre arrivée à destination pour ne pas surchauffer.`;
  } else if (morningTemp < 10) {
    practicalTip = `Privilégiez une couche intermédiaire zippée ou boutonnée (cardigan, gilet) facile à ouvrir si les pièces intérieures sont bien chauffées.`;
  } else {
    practicalTip = `Les matières respirantes (coton, viscose, maille légère) garantissent une régulation thermique naturelle tout au long de la journée.`;
  }

  let vigilancePoint = "";
  if (rainProb >= 40) {
    vigilancePoint = `Risque d'averses de ${rainProb}% : n'oubliez pas un parapluie compact ou une veste déperlante à capuche.`;
  } else if (rainProb >= 20) {
    vigilancePoint = `Faible risque de bruine passagère (${rainProb}%) : gardez une protection légère accessible dans votre sac.`;
  } else if (weatherDay?.afternoon?.uvIndex && weatherDay.afternoon.uvIndex >= 4) {
    vigilancePoint = `Indice UV de ${weatherDay.afternoon.uvIndex} en milieu de journée : lunettes de soleil ou chapeau recommandés pour les sorties extérieures.`;
  } else if (weatherDay?.morning?.windSpeed && weatherDay.morning.windSpeed >= 25) {
    vigilancePoint = `Vent sensible (${Math.round(weatherDay.morning.windSpeed)} km/h) le matin renforçant la sensation de fraîcheur : pensez à un foulard léger ou col montant.`;
  } else {
    vigilancePoint = `Météo stable et calme : aucun risque météorologique majeur pour vos trajets.`;
  }

  // Conseils stylistiques sur les harmonies de couleurs & palette recommandée
  let colorAdvice = "";
  let recommendedPalette: Array<{ name: string; hex: string; role: string }> = [];

  const isHotWeather = afternoonTemp >= 25 || morningTemp >= 20;
  const isFreezingOrCold = morningTemp <= 4 || afternoonTemp <= 6;
  const isRainy = rainProb >= 35;

  if (isHotWeather) {
    colorAdvice = `Par forte chaleur (${Math.round(afternoonTemp)}°C), misez sur des nuances très claires et minérales (blanc lin, écru, beige sable, bleu pastel). Ces teintes réfléchissent le rayonnement solaire pour garder votre corps au frais et éviter la sensation d'étouffement des couleurs sombres.`;
    recommendedPalette = [
      { name: "Blanc lin écru", hex: "#F7F5F0", role: "Haut respirant anti-chaleur" },
      { name: "Sable doré clair", hex: "#EADDC8", role: "Short ou pantalon léger" },
      { name: "Bleu ciel pastel", hex: "#B5D6EA", role: "Touche de fraîcheur estivale" },
      { name: "Vert sauge doux", hex: "#A8C3A8", role: "Accessoire ou surcouche légère" },
    ];
  } else if (isFreezingOrCold) {
    colorAdvice = `Pour cette journée hivernale froide (${Math.round(morningTemp)}°C ressenti), composez une harmonie chaleureuse et texturée. Associez une base enveloppante profonde (bleu marine ou gris charbon) à des accents chaleureux (camel, bordeaux velouté ou vert forêt) qui réchauffent visuellement la silhouette.`;
    recommendedPalette = [
      { name: "Bleu marine profond", hex: "#1B2A41", role: "Manteau chaud isolant" },
      { name: "Gris chiné moyen", hex: "#5C6470", role: "Maille ou gros pull" },
      { name: "Camel velours", hex: "#C88B52", role: "Écharpe ou chaussures" },
      { name: "Écru flocon", hex: "#F4F1EA", role: "Sous-couche thermique douce" },
    ];
  } else if (isRainy) {
    colorAdvice = `Pour contrer la grisaille pluvieuse, structurez votre tenue avec une base déperlante sobre (bleu ardoise ou vert kaki) et illuminez l'ensemble avec un accessoire ou un détail vibrant (jaune moutarde, bordeaux ou terracotta).`;
    recommendedPalette = [
      { name: "Bleu ardoise profond", hex: "#2E3C4D", role: "Imperméable ou veste" },
      { name: "Kaki minéral", hex: "#5B6652", role: "Pantalon chino ou jean" },
      { name: "Moutarde lumineuse", hex: "#DCA134", role: "Touche d'accent énergisante" },
      { name: "Blanc cassé", hex: "#F8F8F6", role: "Baskets ou haut intérieur" },
    ];
  } else {
    colorAdvice = `Pour cette météo douce et équilibrée, privilégiez un camaïeu naturel intemporel : un haut blanc ou crème lumineux, un bas texturé bleu indigo ou beige, rehaussé d'une pointe terracotta ou vert forêt sur la veste ou les accessoires.`;
    recommendedPalette = [
      { name: "Blanc optique pur", hex: "#FFFFFF", role: "T-shirt ou chemise fraîche" },
      { name: "Bleu indigo brut", hex: "#23395B", role: "Jean ou pantalon structuré" },
      { name: "Beige latte doux", hex: "#D8C7B5", role: "Surchemise amovible" },
      { name: "Terracotta chaud", hex: "#BD5338", role: "Détail stylistique d'accent" },
    ];
  }

  return { summary, practicalTip, vigilancePoint, colorAdvice, recommendedPalette };
}

app.post("/api/ai/stylist", async (req, res) => {
  const { profile, context, weatherDay, ruleRecommendation } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const fallback = getDeterministicStylistSynthesis(profile, context, weatherDay, ruleRecommendation);
    return res.status(200).json({
      available: true,
      isFallback: true,
      aiAnalysis: fallback,
      message: "Analyse styliste personnalisée générée par le moteur vestimentaire expert.",
    });
  }

  try {
    const { GoogleGenAI, Type } = await import("@google/genai");
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    // Extraction sécurisée des éléments recommandés
    const protectionLayersText = Array.isArray(ruleRecommendation?.protectionLayers)
      ? ruleRecommendation.protectionLayers.map((i: any) => i?.name).filter(Boolean).join(", ")
      : "Aucune couche supplémentaire requise";

    const baseOutfitObj = ruleRecommendation?.baseOutfit || {};
    const baseOutfitItems: string[] = [
      baseOutfitObj.underwear?.name,
      baseOutfitObj.top?.name,
      baseOutfitObj.layerOption?.name,
      baseOutfitObj.bottom?.name,
      baseOutfitObj.footwear?.name,
    ].filter((name): name is string => Boolean(name));
    const baseOutfitText = baseOutfitItems.length > 0 ? baseOutfitItems.join(", ") : "Tenue usuelle";

    const accessoriesText = Array.isArray(ruleRecommendation?.accessoriesAndAlerts)
      ? ruleRecommendation.accessoriesAndAlerts
          .map((i: any) => i?.title || i?.name || i?.description)
          .filter(Boolean)
          .join(", ")
      : "Aucun";

    const childAgeText = profile?.type === "Enfant" && profile?.childAge !== undefined ? `, Âge: ${profile.childAge} ans` : "";
    const childAdviceText = ruleRecommendation?.childSpecificAdvice
      ? `\n- Contraintes spécifiques Enfant : ${ruleRecommendation.childSpecificAdvice.shoesNotice} ${ruleRecommendation.childSpecificAdvice.dressingNotice}`
      : "";

    const prompt = `Tu es un styliste expert et conseiller météo pour l'application "Assistant Météo Vestimentaire".
Voici les informations du profil utilisateur :
- Nom : ${profile?.name || "Utilisateur"} (${profile?.gender || "Adulte"}, ${profile?.type || "Adulte"}${childAgeText})
- Sensibilité thermique : ${profile?.thermalSensitivity ?? 0} (échelle de -3 = Jamais froid à +3 = Très frileux)
- Ville : ${profile?.location?.name || "Paris"}
- Contexte du jour : ${context?.name || "Quotidien"}
- Formalité requise : ${context?.formality || "Décontractée"}
- Environnement destination : ${context?.destinationEnvironment || "Intérieur"}

Météo de demain analysée sur les 3 moments clés :
- Matin (trajet aller) : ${weatherDay?.morning?.temp ?? 12}°C (ressenti ${weatherDay?.morning?.apparentTemp ?? 11}°C), Pluie: ${weatherDay?.morning?.precipitationProb ?? 0}%, Vent: ${weatherDay?.morning?.windSpeed ?? 10} km/h
- Après-midi (pic thermique) : ${weatherDay?.afternoon?.temp ?? 18}°C (ressenti ${weatherDay?.afternoon?.apparentTemp ?? 18}°C), Pluie: ${weatherDay?.afternoon?.precipitationProb ?? 0}%, UV: ${weatherDay?.afternoon?.uvIndex ?? 2}
- Soir (trajet retour) : ${weatherDay?.evening?.temp ?? 14}°C (ressenti ${weatherDay?.evening?.apparentTemp ?? 13}°C), Pluie: ${weatherDay?.evening?.precipitationProb ?? 0}%

Recommandation du moteur de règles déjà calculée :
- Couches de protection (trajet) : ${protectionLayersText}
- Tenue de base (destination) : ${baseOutfitText}
- Accessoires & Alertes : ${accessoriesText}${childAdviceText}

Règles d'or strictes :
1. Dissocier Trajet et Destination (ne pas avoir trop chaud à l'intérieur, être protégé dehors)
2. Filtrer par Formalité (${context?.formality || "Décontractée"})
3. Traduire l'incertitude météo en conseils pratiques.
4. Vocabulaire accessible : privilégie impérativement des termes de vêtements courants, simples et du quotidien (pas de marques de luxe, reste sur des basiques accessibles).

Fournis une réponse bienveillante, concise et naturelle (150-200 mots max en français) avec :
1. "summary" : Le mot du styliste pour aborder la météo de demain avec sérénité et style.
2. "practicalTip" : Un conseil clé sur la gestion des écarts de température (matin vs après-midi ou intérieur vs extérieur).
3. "vigilancePoint" : Un conseil sur un accessoire ou une incertitude météo (pluie, vent, UV ou fraîcheur du soir).
4. "colorAdvice" : Conseils précis sur les couleurs et harmonies de tons à privilégier (selon la météo : tons clairs et respirants qui repoussent les UV pour forte chaleur ; contrastes chaleureux et matières texturées pour temps froid ; harmonies soignées pour le bureau ou l'école).
5. "recommendedPalette" : Un tableau de 3 à 4 couleurs harmonieuses avec "name" (nom de la teinte, ex: "Blanc lin écru"), "hex" (code hexadécimal couleur, ex: "#F7F5F0") et "role" (rôle dans la tenue, ex: "Haut lumineux anti-chaleur", "Bas sobre", "Touche d'accent").
Réponds en format JSON conforme.`;

    // Chaîne de modèles tolérante aux indisponibilités temporaires (503 / 429)
    const candidateModels = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
    let parsed: {
      summary?: string;
      practicalTip?: string;
      vigilancePoint?: string;
      colorAdvice?: string;
      recommendedPalette?: Array<{ name: string; hex: string; role: string }>;
    } | null = null;
    let successfulModel = "";

    for (const model of candidateModels) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Gemini timeout")), 5000)
        );

        const response: any = await Promise.race([
          ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  summary: { type: Type.STRING },
                  practicalTip: { type: Type.STRING },
                  vigilancePoint: { type: Type.STRING },
                  colorAdvice: { type: Type.STRING },
                  recommendedPalette: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        hex: { type: Type.STRING },
                        role: { type: Type.STRING },
                      },
                      required: ["name", "hex", "role"],
                    },
                  },
                },
                required: [
                  "summary",
                  "practicalTip",
                  "vigilancePoint",
                  "colorAdvice",
                  "recommendedPalette",
                ],
              },
            },
          }),
          timeoutPromise,
        ]);

        const rawText = response.text?.trim() || "";
        if (rawText) {
          const result = JSON.parse(rawText);
          if (result && (result.summary || result.practicalTip)) {
            parsed = result;
            successfulModel = model;
            break;
          }
        }
      } catch (err: any) {
        // En cas d'erreur ou timeout sur ce modèle, continuer vers le modèle candidat suivant
        continue;
      }
    }

    if (parsed) {
      return res.json({
        available: true,
        aiAnalysis: parsed,
        model: successfulModel,
      });
    }

    // Si tous les modèles distants sont momentanément saturés (503), bascule transparente vers l'algorithme expert
    const fallback = getDeterministicStylistSynthesis(profile, context, weatherDay, ruleRecommendation);
    return res.json({
      available: true,
      isFallback: true,
      aiAnalysis: fallback,
      message: "Analyse styliste synthétisée par le moteur expert (serveurs distants temporairement très sollicités).",
    });
  } catch (error: any) {
    // Filet de sécurité absolu : jamais de crash ni de 503 renvoyé au client
    const fallback = getDeterministicStylistSynthesis(profile, context, weatherDay, ruleRecommendation);
    res.status(200).json({
      available: true,
      isFallback: true,
      aiAnalysis: fallback,
      message: "Conseils délivrés par le moteur vestimentaire familial.",
    });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Assistant Météo Vestimentaire server listening on port ${PORT}`);
  });
}

startServer();
