import React, { useState } from "react";
import {
  AlertTriangle,
  Baby,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  ClipboardCopy,
  CloudRain,
  Flame,
  Footprints,
  Hand,
  HardHat,
  Info,
  Layers,
  Lightbulb,
  ListFilter,
  Scissors,
  Shield,
  ShieldAlert,
  Shirt,
  Sparkles,
  Sun,
  Tag,
  ThumbsDown,
  ThumbsUp,
  Umbrella,
  Wind,
} from "lucide-react";
import {
  ClothingItem,
  LifeContext,
  RecommendationOutput,
  UserProfile,
} from "../types";

interface RecommendationCardProps {
  recommendation: RecommendationOutput;
  profile: UserProfile;
  context: LifeContext;
  onOpenFeedback: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  profile,
  context,
  onOpenFeedback,
}) => {
  const [showQuickSummary, setShowQuickSummary] = useState(false);
  const [copied, setCopied] = useState(false);

  const renderClothingIcon = (name: string, className = "w-5 h-5") => {
    switch (name) {
      case "Coat":
      case "Shirt":
        return <Shirt className={className} />;
      case "Shield":
        return <Shield className={className} />;
      case "ShieldAlert":
        return <ShieldAlert className={className} />;
      case "CloudRain":
        return <CloudRain className={className} />;
      case "Footprints":
        return <Footprints className={className} />;
      case "Scissors":
        return <Scissors className={className} />;
      case "Umbrella":
        return <Umbrella className={className} />;
      case "Wind":
        return <Wind className={className} />;
      case "Hand":
        return <Hand className={className} />;
      case "Layers":
        return <Layers className={className} />;
      case "Sparkles":
      default:
        return <Sparkles className={className} />;
    }
  };

  const renderWarmthLevel = (level: number) => {
    return (
      <div className="flex items-center gap-1" title={`Niveau thermique : ${level}/5`}>
        {[1, 2, 3, 4, 5].map((idx) => (
          <span
            key={idx}
            className={`w-2 h-2 rounded-full ${
              idx <= level ? "bg-amber-500" : "bg-slate-200"
            }`}
          />
        ))}
        <span className="text-[10px] font-semibold text-slate-500 ml-1">
          {level === 5 ? "Grand froid" : level >= 3 ? "Chaud" : "Léger"}
        </span>
      </div>
    );
  };

  const getFamilyMemberIcon = () => {
    if (profile.type === "Enfant") {
      if ((profile.childAge ?? 3) <= 2) return "👶";
      if ((profile.childAge ?? 3) <= 5) return "🧒";
      return profile.gender === "Femme" ? "👧" : "👦";
    }
    if (profile.name.toLowerCase().includes("maman") || profile.gender === "Femme") return "👩";
    return "👨";
  };

  const memberEmoji = getFamilyMemberIcon();

  // Copier le résumé express dans le presse-papier
  const handleCopySummary = (e: React.MouseEvent) => {
    e.stopPropagation();
    const jacketStr =
      recommendation.protectionLayers.length > 0
        ? recommendation.protectionLayers.map((l) => l.name).join(", ")
        : "Aucune veste lourde requise (matin doux)";

    const items = [
      `☀️ Tenue pour ${profile.name} demain (${context.name}) :`,
      `• 🧥 Trajet (matin/soir) : ${jacketStr}`,
      `• 👕 Haut de journée : ${recommendation.baseOutfit.top.name}`,
      `• 👖 Bas : ${recommendation.baseOutfit.bottom.name}`,
      `• 👟 Chaussures : ${recommendation.baseOutfit.footwear.name}`,
      recommendation.baseOutfit.layerOption
        ? `• 🧶 Couche amovible : ${recommendation.baseOutfit.layerOption.name}`
        : null,
      recommendation.baseOutfit.underwear
        ? `• 👶 Sous-couche : ${recommendation.baseOutfit.underwear.name}`
        : null,
      recommendation.accessoriesAndAlerts.length > 0
        ? `• 🎒 À glisser dans le sac : ${recommendation.accessoriesAndAlerts
            .map((a) => (a.item ? a.item.name : a.title))
            .join(", ")}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(items);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // Synthèse intelligente du Conseil Journée
  const morningTemp = recommendation.effectiveFeltMorning;
  const eveningTemp = recommendation.effectiveFeltEvening;
  const hasJacket = recommendation.protectionLayers.length > 0;
  const jacketName = hasJacket ? recommendation.protectionLayers[0].name : "une surcouche légère";
  const rainAlert = recommendation.accessoriesAndAlerts.find((a) => a.title.toLowerCase().includes("pluie"));

  const generateDayAdvice = () => {
    const parts: string[] = [];

    // Conseil trajet matin vs journée
    if (morningTemp <= 8) {
      parts.push(
        `Le matin démarre très frais (${morningTemp}°C ressenti) : couvrez bien ${profile.name} avec ${jacketName} pour le départ.`
      );
    } else if (morningTemp <= 14) {
      parts.push(
        `Départ matinal frais (${morningTemp}°C) : prévoyez ${jacketName} pour le trajet.`
      );
    } else {
      parts.push(
        `Matinée très douce (${morningTemp}°C) : un départ léger sans manteau lourd est tout à fait adapté.`
      );
    }

    // Conseil intérieur / journée
    parts.push(
      `Pour la journée en environnement "${context.destinationEnvironment}", la tenue reste confortable (${recommendation.baseOutfit.top.name} et ${recommendation.baseOutfit.bottom.name}) dans le respect du dress code ${context.formality}.`
    );

    // Amovible ou pluie
    if (recommendation.baseOutfit.layerOption) {
      parts.push(
        `Pensez à la couche amovible (${recommendation.baseOutfit.layerOption.name}) facile à ôter si la pièce est bien chauffée.`
      );
    }

    if (rainAlert) {
      parts.push(`Prudence météo : gardez un parapluie ou un vêtement déperlant à portée de main.`);
    }

    return parts.join(" ");
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* EN-TÊTE : TENUE RECOMMANDÉE + CONSEIL JOURNÉE & RÉSUMÉ EXPRESS CLIQUABLE */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white rounded-3xl p-5 sm:p-6 shadow-sm border border-orange-300/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs text-amber-100 font-semibold bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20">
                Pour demain toute la journée
              </span>
              <span className="text-xs text-white/90 font-medium">
                Programme : <strong className="text-white">{context.name}</strong> ({context.formality})
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-heading flex items-center gap-2">
              <span className="text-2xl">{memberEmoji}</span>
              Tenue recommandée pour {profile.name}
            </h2>
          </div>

          {/* Bouton pour afficher/masquer le résumé rapide */}
          <button
            onClick={() => setShowQuickSummary(!showQuickSummary)}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-amber-50 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-102"
            title="Afficher ou masquer la liste rapide des vêtements à porter et à emporter"
          >
            <ListFilter className="w-4 h-4 text-amber-600" />
            <span>{showQuickSummary ? "Masquer le résumé rapide" : "📋 Résumé rapide des vêtements"}</span>
            {showQuickSummary ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>

        {/* Bloc Conseil Journée directement visible */}
        <div className="mt-4 pt-4 border-t border-white/20 bg-black/15 rounded-2xl p-4 flex items-start gap-3 text-xs">
          <div className="p-2 rounded-xl bg-amber-400 text-amber-950 shrink-0 shadow-2xs">
            <Lightbulb className="w-4 h-4 font-bold" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-amber-200 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5 font-heading">
              <span>Conseil de la journée</span>
              <span className="text-[11px] font-normal text-amber-100 lowercase">
                • {profile.name} ({context.destinationEnvironment})
              </span>
            </div>
            <p className="text-white text-xs sm:text-sm leading-relaxed font-medium">
              {generateDayAdvice()}
            </p>
          </div>
        </div>

        {/* Résumé rapide des vêtements déployable en un clic */}
        {showQuickSummary && (
          <div className="mt-4 pt-4 border-t border-white/25">
            <div className="bg-white rounded-2xl p-4 sm:p-5 text-slate-900 shadow-md border border-white/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📋</span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 font-heading">
                      Mémo express : Ce que {profile.name} va porter demain
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Vue synthétique pour préparer les vêtements en quelques secondes ce soir ou demain matin.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold border border-amber-200 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  {copied ? (
                    <>
                      <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copié dans le presse-papier !</span>
                    </>
                  ) : (
                    <>
                      <ClipboardCopy className="w-3.5 h-3.5 text-amber-700" />
                      <span>Copier la liste</span>
                    </>
                  )}
                </button>
              </div>

              {/* Checklist synthétique rapide */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {/* 1. Trajet */}
                <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-200">
                  <div className="flex items-center gap-1.5 text-sky-900 font-bold mb-1">
                    <Shirt className="w-3.5 h-3.5 text-sky-600" />
                    <span>Pour le trajet (matin / soir)</span>
                  </div>
                  <div className="font-semibold text-slate-800 text-xs mt-1">
                    {recommendation.protectionLayers.length > 0
                      ? recommendation.protectionLayers.map((l) => l.name).join(" + ")
                      : "Veste légère ou coupe-vent d'appoint"}
                  </div>
                  <div className="text-[11px] text-sky-700 mt-1">
                    Matin : {recommendation.effectiveFeltMorning}°C • Soir : {recommendation.effectiveFeltEvening}°C
                  </div>
                </div>

                {/* 2. Haut */}
                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold mb-1">
                    <Shirt className="w-3.5 h-3.5 text-amber-600" />
                    <span>Haut de journée</span>
                  </div>
                  <div className="font-semibold text-slate-800 text-xs mt-1">
                    {recommendation.baseOutfit.top.name}
                  </div>
                  {recommendation.baseOutfit.layerOption && (
                    <div className="text-[11px] text-amber-700 mt-1">
                      + Couche amovible : {recommendation.baseOutfit.layerOption.name}
                    </div>
                  )}
                </div>

                {/* 3. Bas */}
                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold mb-1">
                    <Scissors className="w-3.5 h-3.5 text-amber-600" />
                    <span>Bas / Pantalon</span>
                  </div>
                  <div className="font-semibold text-slate-800 text-xs mt-1">
                    {recommendation.baseOutfit.bottom.name}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Style {context.formality}
                  </div>
                </div>

                {/* 4. Chaussures */}
                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold mb-1">
                    <Footprints className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Chaussures</span>
                  </div>
                  <div className="font-semibold text-slate-800 text-xs mt-1">
                    {recommendation.baseOutfit.footwear.name}
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-1">
                    {recommendation.baseOutfit.footwear.waterproofLevel >= 2
                      ? "Résistant à la pluie"
                      : "Confort quotidien"}
                  </div>
                </div>

                {/* 5. Bébé / Enfant spécial si présent */}
                {recommendation.baseOutfit.underwear && (
                  <div className="bg-purple-50/70 p-3 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-1.5 text-purple-900 font-bold mb-1">
                      <Baby className="w-3.5 h-3.5 text-purple-600" />
                      <span>Sous-couche & Change bébé</span>
                    </div>
                    <div className="font-semibold text-slate-800 text-xs mt-1">
                      {recommendation.baseOutfit.underwear.name}
                    </div>
                    <div className="text-[11px] text-purple-700 mt-1">
                      1ère couche douce respirante
                    </div>
                  </div>
                )}

                {/* 6. Accessoires & Sac */}
                <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-200">
                  <div className="flex items-center gap-1.5 text-rose-900 font-bold mb-1">
                    <Umbrella className="w-3.5 h-3.5 text-rose-600" />
                    <span>À glisser dans le sac</span>
                  </div>
                  <div className="font-semibold text-slate-800 text-xs mt-1">
                    {recommendation.accessoriesAndAlerts.length > 0
                      ? recommendation.accessoriesAndAlerts
                          .map((a) => (a.item ? a.item.name : a.title))
                          .join(", ")
                      : "Aucun accessoire lourd (sac allégé)"}
                  </div>
                  <div className="text-[11px] text-rose-700 mt-1">
                    {recommendation.accessoriesAndAlerts.length} précaution(s) météo
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1 : COUCHES DE PROTECTION (POUR LE TRAJET) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-sky-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-sky-100 gap-2 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-base shadow-2xs">
              1
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Couches de Protection Extérieure (Pour les trajets)
              </h3>
              <p className="text-xs text-slate-500">
                La veste amovible pour le matin (départ école/bureau) et la sortie de fin de journée
              </p>
            </div>
          </div>

          <span className="self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
            Trajet matin {recommendation.effectiveFeltMorning}°C • Soir {recommendation.effectiveFeltEvening}°C
          </span>
        </div>

        {recommendation.protectionLayers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendation.protectionLayers.map((layer) => (
              <div
                key={layer.id}
                className="p-4 rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50/50 via-white to-sky-50/20 flex items-start gap-3.5"
              >
                <div className="p-3 rounded-2xl bg-white border border-sky-200 text-sky-600 shadow-xs shrink-0">
                  {renderClothingIcon(layer.iconName, "w-6 h-6")}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900 font-heading">{layer.name}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                      {layer.subCategory}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{layer.description}</p>

                  <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-sky-100 flex-wrap">
                    {renderWarmthLevel(layer.warmthLevel)}
                    {layer.waterproofLevel > 0 && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <CloudRain className="w-2.5 h-2.5" />
                        {layer.waterproofLevel >= 2 ? "Imperméable" : "Déperlant"}
                      </span>
                    )}
                    {layer.windproof && (
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <Wind className="w-2.5 h-2.5" /> Coupe-vent
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Les températures du matin et du soir sont suffisamment douces ({recommendation.effectiveFeltMorning}°C) : aucune veste lourde n'est requise pour le trajet.
            </span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2 : TENUE DE BASE (POUR LA DESTINATION) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-amber-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-amber-100 gap-2 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-base shadow-2xs">
              2
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Tenue Principale (Pour toute la journée)
              </h3>
              <p className="text-xs text-slate-500">
                Adaptée à l'environnement intérieur (<strong>{context.destinationEnvironment}</strong>) et au dress code (<strong>{context.formality}</strong>)
              </p>
            </div>
          </div>

          <span className="self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
            {context.formality}
          </span>
        </div>

        {/* Sous-vêtement & Change spécial tout-petits (< 3 ans) */}
        {recommendation.baseOutfit.underwear && (
          <div className="mb-4 p-4 rounded-2xl border border-purple-200 bg-purple-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-white border border-purple-300 text-purple-700 shadow-2xs shrink-0">
                <Baby className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-200 text-purple-950 px-2 py-0.5 rounded-full font-heading">
                    Bébé &amp; Tout-petit (&lt; 3 ans) • 1ère Couche
                  </span>
                  <span className="text-sm font-bold text-slate-900 font-heading">
                    {recommendation.baseOutfit.underwear.name}
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  {recommendation.baseOutfit.underwear.description}
                </p>
                {recommendation.baseOutfit.underwear.tips && (
                  <p className="text-[11px] font-semibold text-purple-900 mt-1.5 flex items-center gap-1">
                    💡 <span>{recommendation.baseOutfit.underwear.tips}</span>
                  </p>
                )}
              </div>
            </div>
            <div className="self-end sm:self-auto shrink-0">
              <span className="text-xs font-bold text-purple-950 bg-white px-3 py-1 rounded-xl border border-purple-200 shadow-2xs">
                Body &amp; change doux
              </span>
            </div>
          </div>
        )}

        {/* Style Casual au travail : T-shirt & Baskets */}
        {recommendation.casualStyleNotice && (
          <div className="mb-4 p-3.5 rounded-2xl border border-teal-200 bg-teal-50/70 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-white border border-teal-300 text-teal-700 shadow-2xs shrink-0">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-teal-200 text-teal-950 px-2 py-0.5 rounded-full font-heading">
                  Style Casual &quot;T-shirt &amp; Baskets&quot;
                </span>
                <span className="text-xs font-bold text-teal-900">Adapté à votre journée</span>
              </div>
              <p className="text-xs text-teal-950 mt-1 leading-relaxed">
                {recommendation.casualStyleNotice}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Haut principal */}
          <div className="p-4 rounded-2xl border border-amber-200/80 bg-amber-50/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 font-heading">
                <span>Haut Principal</span>
                <span className="text-amber-600 font-bold">Base</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-white border border-amber-200 text-amber-700 shadow-2xs">
                  {renderClothingIcon(recommendation.baseOutfit.top.iconName)}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 font-heading">
                    {recommendation.baseOutfit.top.name}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {recommendation.baseOutfit.top.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-amber-200/60 flex items-center justify-between">
              {renderWarmthLevel(recommendation.baseOutfit.top.warmthLevel)}
              <span className="text-[10px] font-bold text-slate-500">
                {context.destinationEnvironment}
              </span>
            </div>
          </div>

          {/* Bas */}
          <div className="p-4 rounded-2xl border border-amber-200/80 bg-amber-50/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 font-heading">
                <span>Bas / Pantalon</span>
                <span className="text-amber-600 font-bold">Base</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-white border border-amber-200 text-amber-700 shadow-2xs">
                  {renderClothingIcon(recommendation.baseOutfit.bottom.iconName)}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 font-heading">
                    {recommendation.baseOutfit.bottom.name}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {recommendation.baseOutfit.bottom.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-amber-200/60 flex items-center justify-between">
              {renderWarmthLevel(recommendation.baseOutfit.bottom.warmthLevel)}
              <span className="text-[10px] font-bold text-slate-500">
                Coupe {context.formality}
              </span>
            </div>
          </div>

          {/* Chaussures */}
          <div className="p-4 rounded-2xl border border-amber-200/80 bg-amber-50/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 font-heading">
                <span>Chaussures</span>
                <span className="text-amber-600 font-bold">Base</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-white border border-amber-200 text-amber-700 shadow-2xs">
                  {renderClothingIcon(recommendation.baseOutfit.footwear.iconName)}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 font-heading">
                    {recommendation.baseOutfit.footwear.name}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {recommendation.baseOutfit.footwear.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-1">
              {renderWarmthLevel(recommendation.baseOutfit.footwear.warmthLevel)}
              <div className="flex items-center gap-1.5 flex-wrap">
                {recommendation.baseOutfit.footwear.features?.includes("safety") && (
                  <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                    🥾 EPI Sécurité
                  </span>
                )}
                {recommendation.baseOutfit.footwear.features?.includes("sneakers") && (
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    👟 Sneakers Casual
                  </span>
                )}
                {profile.type === "Enfant" && (profile.childAge ?? 3) <= 6 && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300">
                    Sans lacets (Scratchs)
                  </span>
                )}
                {recommendation.baseOutfit.footwear.waterproofLevel >= 2 ? (
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    Résiste à l'eau
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-500">Urbain</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Option de superposition amovible (ex: Cardigan si amplitude ou clim) */}
        {recommendation.baseOutfit.layerOption && (
          <div className="mt-4 p-4 rounded-2xl border border-amber-300 bg-amber-50/70 flex items-start gap-3">
            <Layers className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-amber-900 uppercase font-heading">
                  Recommandation Clé : Couche Amovible
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {recommendation.baseOutfit.layerOption.name}
                </span>
              </div>
              <p className="text-xs text-amber-950 mt-1 leading-relaxed">
                {recommendation.baseOutfit.layerOption.description} (Idéal pour s'adapter sans inconfort entre la fraîcheur matinale et l'après-midi).
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION SPÉCIFIQUE ENFANT : AUTONOMIE & SOIN */}
      {/* ========================================================================= */}
      {recommendation.childSpecificAdvice && (
        <div className="bg-gradient-to-br from-indigo-50/50 via-purple-50/40 to-pink-50/40 rounded-3xl border border-purple-200 p-6 shadow-xs">
          <div className="flex items-center gap-3 pb-3.5 border-b border-purple-200/70 mb-4">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-2xs">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-indigo-950 font-heading">
                Spécial Enfant : Autonomie &amp; Motricité ({recommendation.childSpecificAdvice.age} ans)
              </h3>
              <p className="text-xs text-indigo-700">
                Conseils calibrés pour l'habillage seul, les fermetures éclairs et la cour de récréation
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white/90 border border-purple-200 flex items-start gap-3.5 shadow-2xs">
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700 shrink-0">
                <Footprints className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-indigo-950 mb-1 font-heading">
                  Chaussures &amp; Motricité (Scratchs vs Lacets)
                </div>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  {recommendation.childSpecificAdvice.shoesNotice}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 border border-purple-200 flex items-start gap-3.5 shadow-2xs">
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700 shrink-0">
                <Shirt className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-indigo-950 mb-1 font-heading">
                  Habillage &amp; Praticité au quotidien
                </div>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  {recommendation.childSpecificAdvice.dressingNotice}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION SPÉCIFIQUE TRAVAIL & SÉCURITÉ (EPI) */}
      {/* ========================================================================= */}
      {recommendation.workEquipmentAdvice && (
        <div className="bg-white rounded-3xl border border-amber-300 p-6 shadow-xs">
          <div className="flex items-center gap-3 pb-3.5 border-b border-amber-100 mb-4">
            <div className="w-9 h-9 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-2xs">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-950 font-heading">
                Équipements Professionnels &amp; Sécurité au Travail (EPI)
              </h3>
              <p className="text-xs text-amber-700">
                Conseils thermiques et d'adaptation météo pour les chaussures de sécurité, la visibilité et les chantiers
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            {recommendation.workEquipmentAdvice.safetyShoesNotice && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white text-amber-700 shadow-2xs shrink-0">
                  <Footprints className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-amber-950 mb-1 font-heading">
                    Chaussures de Sécurité &amp; Pont Thermique
                  </div>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    {recommendation.workEquipmentAdvice.safetyShoesNotice}
                  </p>
                </div>
              </div>
            )}

            {recommendation.workEquipmentAdvice.highVisNotice && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white text-amber-700 shadow-2xs shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-amber-950 mb-1 font-heading">
                    Haute Visibilité &amp; Signalisation
                  </div>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    {recommendation.workEquipmentAdvice.highVisNotice}
                  </p>
                </div>
              </div>
            )}

            {recommendation.workEquipmentAdvice.workWearNotice && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white text-amber-700 shadow-2xs shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-amber-950 mb-1 font-heading">
                    Pantalon Technique &amp; Ergonomie
                  </div>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    {recommendation.workEquipmentAdvice.workWearNotice}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3 : ACCESSOIRES & ALERTES (INCERTITUDES ET PRÉVENTIONS) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-rose-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-rose-100 gap-2 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-base shadow-2xs">
              3
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Accessoires Malin &amp; Alertes Météo
              </h3>
              <p className="text-xs text-slate-500">
                Dans le cartable ou le sac : parapluie compact, chapeau, lunettes ou rechange en cas d'imprévu
              </p>
            </div>
          </div>

          <span className="self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
            {recommendation.accessoriesAndAlerts.length} précaution(s)
          </span>
        </div>

        {recommendation.accessoriesAndAlerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendation.accessoriesAndAlerts.map((alert, index) => {
              const isAlert = alert.urgency === "alerte";
              const isAdvice = alert.urgency === "conseil";

              return (
                <div
                  key={index}
                  className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-colors ${
                    isAlert
                      ? "border-rose-300 bg-rose-50/50 text-rose-950"
                      : isAdvice
                      ? "border-amber-300 bg-amber-50/50 text-amber-950"
                      : "border-sky-300 bg-sky-50/40 text-sky-950"
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl shrink-0 shadow-2xs ${
                      isAlert
                        ? "bg-rose-200/80 text-rose-800"
                        : isAdvice
                        ? "bg-amber-200/80 text-amber-800"
                        : "bg-sky-200/80 text-sky-800"
                    }`}
                  >
                    {alert.item ? (
                      renderClothingIcon(alert.item.iconName, "w-5 h-5")
                    ) : alert.iconName === "Wind" ? (
                      <Wind className="w-5 h-5" />
                    ) : (
                      <Umbrella className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 font-heading">{alert.title}</span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          isAlert
                            ? "bg-rose-200 text-rose-900 font-bold"
                            : isAdvice
                            ? "bg-amber-200 text-amber-950 font-bold"
                            : "bg-sky-200 text-sky-900 font-bold"
                        }`}
                      >
                        {alert.urgency}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      {alert.description}
                    </p>

                    {alert.item && (
                      <div className="mt-2.5 text-[11px] font-semibold text-slate-900 flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-500 font-normal">À glisser dans le sac :</span>
                        <span className="bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs font-bold text-slate-800">
                          {alert.item.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 text-emerald-900 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">
              Météo calme et stable pour demain : pas de risque de pluie notable, sac allégé !
            </span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* PHASE 4 : AMÉLIORATION CONTINUE & FEEDBACK UTILISATEUR */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-rose-50/80 rounded-3xl border border-amber-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
            🌟
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 font-heading">
              Comment s'est passée la journée ?
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Votre retour calibre automatiquement la sensibilité au froid de {profile.name} pour les prochains jours.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            onClick={onOpenFeedback}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 transition-all shadow-2xs hover:scale-102 cursor-pointer"
          >
            <ThumbsUp className="w-4 h-4 text-emerald-600" />
            <span>Parfait !</span>
          </button>
          <button
            onClick={onOpenFeedback}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 transition-all shadow-2xs hover:scale-102 cursor-pointer"
          >
            <ThumbsDown className="w-4 h-4 text-rose-500" />
            <span>À réajuster</span>
          </button>
        </div>
      </div>
    </div>
  );
};
