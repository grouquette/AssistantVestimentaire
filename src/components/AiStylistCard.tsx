import React, { useState } from "react";
import {
  Sparkles,
  Lightbulb,
  AlertCircle,
  RotateCw,
  Bot,
  Palette,
} from "lucide-react";
import {
  DayMoments,
  LifeContext,
  RecommendationOutput,
  UserProfile,
  StylistAnalysis,
} from "../types";

interface AiStylistCardProps {
  profile: UserProfile;
  context: LifeContext;
  weather: DayMoments;
  recommendation: RecommendationOutput;
}

export const AiStylistCard: React.FC<AiStylistCardProps> = ({
  profile,
  context,
  weather,
  recommendation,
}) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<StylistAnalysis | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleGenerateAiStylist = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/ai/stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          context,
          weatherDay: weather,
          ruleRecommendation: recommendation,
        }),
      });

      const data = await res.json();
      if (data.available && data.aiAnalysis) {
        setAnalysis(data.aiAnalysis);
        if (data.isFallback && data.message) {
          setStatusMessage(data.message);
        }
      } else {
        // Fallback intelligent
        setStatusMessage(data.message || "Analyse styliste synthétisée par le moteur vestimentaire.");
        const isHot = (weather.afternoon?.temp ?? 18) >= 25;
        const isCold = (weather.morning?.temp ?? 12) <= 5;
        setAnalysis({
          summary: `Pour ${profile.name} en contexte "${context.name}", la tenue proposée concilie le confort intérieur (${context.destinationEnvironment}) et la protection extérieure lors des trajets du matin et du soir.`,
          practicalTip: `Pensez à bien boutonner votre couche extérieure le matin au départ pour bloquer les courants d'air, puis retirez-la dès votre arrivée à destination pour rester à l'aise toute la journée.`,
          vigilancePoint: weather.maxRainProb >= 30
            ? `Attention au risque de pluie de ${weather.maxRainProb}% : gardez votre parapluie à portée de main.`
            : `Conditions favorables sans intempérie majeure annoncée.`,
          colorAdvice: isHot
            ? `Par forte chaleur, privilégiez des teintes claires et lumineuses (lin écru, blanc, beige sable, bleu ciel) qui repoussent les rayons UV et évitent l'accumulation thermique.`
            : isCold
            ? `Pour affronter le froid, privilégiez des nuances riches et texturées (marine profond, gris anthracite, camel et écru) qui réchauffent visuellement la silhouette.`
            : `Optez pour des accords intemporels : un haut clair et lumineux, un bas sobre (denim brut ou chino) et une touche chaleureuse sur les accessoires.`,
          recommendedPalette: isHot
            ? [
                { name: "Blanc lin écru", hex: "#F7F5F0", role: "Haut respirant anti-chaleur" },
                { name: "Sable doré clair", hex: "#EADDC8", role: "Short ou pantalon léger" },
                { name: "Bleu ciel pastel", hex: "#B5D6EA", role: "Touche de fraîcheur estivale" },
                { name: "Vert sauge doux", hex: "#A8C3A8", role: "Accessoire d'été" },
              ]
            : [
                { name: "Bleu marine profond", hex: "#1B2A41", role: "Manteau ou pantalon sobre" },
                { name: "Gris chiné", hex: "#5C6470", role: "Maille ou pull chaud" },
                { name: "Camel velours", hex: "#C88B52", role: "Écharpe ou chaussures" },
                { name: "Blanc cassé", hex: "#F8F8F6", role: "Haut lumineux" },
              ],
        });
      }
    } catch (err: any) {
      console.warn("AI Stylist error, providing local synthesis:", err);
      setAnalysis({
        summary: `Tenue équilibrée pour ${profile.name} respectant strictement le niveau "${context.formality}".`,
        practicalTip: `En cas d'écart thermique prononcé, la superposition reste votre meilleur atout.`,
        vigilancePoint: `Vérifiez l'état du ciel avant votre trajet retour.`,
        colorAdvice: `Privilégiez des teintes douces et équilibrées, faciles à coordonner selon l'ambiance lumineuse du jour.`,
        recommendedPalette: [
          { name: "Blanc pur", hex: "#FFFFFF", role: "Haut lumineux" },
          { name: "Bleu marine", hex: "#1E3A8A", role: "Pièce principale" },
          { name: "Beige doux", hex: "#D6C7B2", role: "Superposition" },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-sm mb-6 border border-indigo-800/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-800/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-400/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wide flex items-center gap-1.5 text-white">
              Le Conseil Styliste & Synthèse IA
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </h3>
            <p className="text-[11px] text-indigo-200">
              Analyse contextuelle croisant sensibilité thermique, météo horaire et harmonies de couleurs.
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerateAiStylist}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all shadow-xs cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          {loading ? (
            <>
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>Génération en cours...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{analysis ? "Régénérer l'avis IA" : "Demander l'avis Styliste IA"}</span>
            </>
          )}
        </button>
      </div>

      {statusMessage && (
        <div className="mt-3 text-[11px] text-indigo-200/90 bg-indigo-950/60 p-2 rounded-lg border border-indigo-800/60">
          {statusMessage}
        </div>
      )}

      {analysis ? (
        <div className="mt-4 space-y-3">
          {analysis.summary && (
            <p className="text-xs text-indigo-100 leading-relaxed font-normal bg-indigo-950/40 p-3 rounded-xl border border-indigo-800/30">
              « {analysis.summary} »
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysis.practicalTip && (
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-amber-200 block mb-0.5">
                    Astuce pratique température
                  </span>
                  <span className="text-slate-300 leading-relaxed">
                    {analysis.practicalTip}
                  </span>
                </div>
              </div>
            )}

            {analysis.vigilancePoint && (
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-sky-300 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-sky-200 block mb-0.5">
                    Point de vigilance météo
                  </span>
                  <span className="text-slate-300 leading-relaxed">
                    {analysis.vigilancePoint}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section Conseils de Couleurs & Palette Recommandée */}
          {(analysis.colorAdvice || (analysis.recommendedPalette && analysis.recommendedPalette.length > 0)) && (
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 mt-3">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-4 h-4 text-pink-300 shrink-0" />
                <span className="font-bold text-xs text-pink-200">
                  Harmonie des couleurs & Palette recommandée
                </span>
              </div>

              {analysis.colorAdvice && (
                <p className="text-xs text-slate-200 leading-relaxed mb-3">
                  {analysis.colorAdvice}
                </p>
              )}

              {analysis.recommendedPalette && analysis.recommendedPalette.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {analysis.recommendedPalette.map((color, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/60 rounded-lg p-2 border border-white/10 flex items-center gap-2.5"
                    >
                      <div
                        className="w-6 h-6 rounded-full shrink-0 shadow-xs border border-white/20"
                        style={{ backgroundColor: color.hex }}
                        title={`${color.name} (${color.hex})`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-semibold text-white truncate">
                          {color.name}
                        </div>
                        <div className="text-[9px] text-slate-400 truncate">
                          {color.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3 text-xs text-indigo-200/70 flex items-center justify-between">
          <span>
            Cliquez sur « Demander l'avis Styliste IA » pour obtenir une note sur-mesure pour {profile.name} avec conseils de couleurs.
          </span>
        </div>
      )}
    </div>
  );
};
