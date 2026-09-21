import { CLOTHING_CATALOG } from "../data/clothingCatalog";
import {
  ChildSpecificAdvice,
  ClothingItem,
  DayMoments,
  LifeContext,
  RecommendationOutput,
  UserProfile,
} from "../types";

export function generateOutfitRecommendation(
  profile: UserProfile,
  context: LifeContext,
  weather: DayMoments
): RecommendationOutput {
  // 1. Modificateur thermique sur le ressenti
  // Sensibilité de -3 (Jamais froid) à +3 (Très frileux)
  // Un frileux ressent une température plus basse de (thermalSensitivity * 1.5) °C
  const modifier = profile.thermalSensitivity * 1.5;

  const effectiveFeltMorning = Math.round((weather.morning.apparentTemp - modifier) * 10) / 10;
  const effectiveFeltAfternoon = Math.round((weather.afternoon.apparentTemp - modifier) * 10) / 10;
  const effectiveFeltEvening = Math.round((weather.evening.apparentTemp - modifier) * 10) / 10;

  // Température clé du trajet (matin / soir)
  const commuteTemp = Math.min(effectiveFeltMorning, effectiveFeltEvening);
  const commuteRainProb = Math.max(
    weather.morning.precipitationProb,
    weather.evening.precipitationProb
  );
  const commutePrecipitation = Math.max(
    weather.morning.precipitationMm,
    weather.evening.precipitationMm
  );

  const childAge = profile.type === "Enfant" ? (profile.childAge ?? 3) : undefined;

  // Récupération des préférences et des équipements professionnels
  const clothingPrefs = profile.clothingPreferences || {};
  const workEquipment = {
    ...(profile.defaultWorkEquipment || {}),
    ...(context.workEquipment || {}),
  };
  const isSafetyContext =
    context.formality === "Professionnel / Chantier & EPI" ||
    Boolean(workEquipment.safetyShoes);
  const isCasualWorkContext =
    context.formality === "Casual (T-shirt & Baskets)" ||
    clothingPrefs.preferredStyle === "Casual (T-shirt & Baskets)" ||
    (clothingPrefs.prefersTshirts && context.formality === "Business Casual");

  // Helper pour filtrer selon formalité, type, genre et âge de l'enfant
  const matchesProfileAndFormality = (item: ClothingItem): boolean => {
    const formalityOk =
      item.allowedFormalities.includes(context.formality) ||
      (isCasualWorkContext && item.allowedFormalities.includes("Casual (T-shirt & Baskets)")) ||
      (isSafetyContext && item.allowedFormalities.includes("Professionnel / Chantier & EPI"));
    const typeOk = item.allowedTypes.includes(profile.type);
    const genderOk = item.allowedGenders.includes(profile.gender);

    // Contrôle d'âge si profil enfant
    if (profile.type === "Enfant" && childAge !== undefined) {
      if (item.minChildAge !== undefined && childAge < item.minChildAge) {
        return false;
      }
      if (item.maxChildAge !== undefined && childAge > item.maxChildAge) {
        return false;
      }
    } else if (profile.type === "Adulte") {
      // Les adultes ne portent pas les articles à maxChildAge (comme les bodies bébé)
      if (item.maxChildAge !== undefined) {
        return false;
      }
    }

    return formalityOk && typeOk && genderOk;
  };

  // =========================================================================
  // ANALYSE DU RÉGIME THERMIQUE GLOBAL (EXTRÊMES DE TEMPÉRATURE)
  // =========================================================================
  const maxDayTemp = Math.max(weather.morning.temp, weather.afternoon.temp, weather.evening.temp);
  const minDayTemp = Math.min(weather.morning.temp, weather.afternoon.temp, weather.evening.temp);
  const maxDayFelt = Math.max(effectiveFeltMorning, effectiveFeltAfternoon, effectiveFeltEvening);
  const minDayFelt = Math.min(effectiveFeltMorning, effectiveFeltAfternoon, effectiveFeltEvening);

  // Forte chaleur / Canicule (ex. > 28°C ou ressenti > 30°C)
  const isVeryHot = maxDayTemp >= 28 || maxDayFelt >= 28;
  const isWarmOrHot = maxDayTemp >= 24 || maxDayFelt >= 24;

  // Grand froid et températures négatives (ex. <= 0°C ou ressenti <= 0°C)
  const isNegativeFreezing = minDayTemp <= 0 || minDayFelt <= 0 || commuteTemp <= 0;
  const isColdOrFreezing = minDayTemp <= 5 || minDayFelt <= 5 || commuteTemp <= 5;

  // =========================================================================
  // RÈGLE N°1 & N°2 : COUCHES DE PROTECTION (POUR LE TRAJET)
  // Dictées par la météo extérieure (température du trajet, vent, pluie)
  // Filtrées par la formalité requise
  // =========================================================================
  const protectionCandidates = CLOTHING_CATALOG.filter(
    (item) => item.section === "couche_protection" && matchesProfileAndFormality(item)
  );

  const selectedProtectionLayers: ClothingItem[] = [];

  // Déterminer le niveau de chaleur nécessaire pour le trajet
  // <= 0°C (négatif) : niveau 5 (doudoune grand froid / parka polaire)
  // 1°C - 5°C : niveau 5 ou 4
  // 6°C - 10°C : niveau 4
  // 11°C - 16°C : niveau 3
  // 17°C - 22°C : niveau 2
  // > 22°C : niveau 1 ou AUCUN manteau
  let targetWarmth = 1;
  if (commuteTemp <= 1) targetWarmth = 5;
  else if (commuteTemp <= 6) targetWarmth = 4;
  else if (commuteTemp < 15) targetWarmth = 3;
  else if (commuteTemp < 22) targetWarmth = 2;
  else targetWarmth = 1;

  // Si pluie marquée lors du trajet (> 50% ou > 0.5mm), privilégier imperméable/déperlant
  const rainDemandsWaterproof = commuteRainProb >= 50 || commutePrecipitation > 0.5;

  let bestOuterLayer: ClothingItem | undefined;

  // Si équipement haute visibilité requis pour un travailleur
  if (workEquipment.highVisibility && (commuteTemp < 18 || rainDemandsWaterproof)) {
    bestOuterLayer = CLOTHING_CATALOG.find((c) => c.id === "prot-parka-haute-visibilite");
  } else if (isNegativeFreezing) {
    // Grand froid / températures négatives : Doudoune grand froid isolante
    bestOuterLayer =
      protectionCandidates.find((c) => c.id === "prot-doudoune-grand-froid") ||
      protectionCandidates.find((c) => c.id === "prot-parka-chaude") ||
      protectionCandidates.find((c) => c.warmthLevel === 5);
  }

  if (!bestOuterLayer) {
    bestOuterLayer = protectionCandidates.find((c) => {
      const warmthDiff = Math.abs(c.warmthLevel - targetWarmth);
      if (rainDemandsWaterproof) {
        return c.waterproofLevel >= 2 && warmthDiff <= 1;
      }
      return warmthDiff === 0;
    });
  }

  if (!bestOuterLayer) {
    // Fallback sur le plus proche en chaleur
    bestOuterLayer = [...protectionCandidates].sort(
      (a, b) => Math.abs(a.warmthLevel - targetWarmth) - Math.abs(b.warmthLevel - targetWarmth)
    )[0];
  }

  // N'ajouter un manteau que si nécessaire
  // IMPORTANT : Par forte chaleur (> 22°C ressenti trajet), AUCUN manteau lourd ne doit être proposé
  if (
    !isVeryHot &&
    (commuteTemp < 20 ||
      rainDemandsWaterproof ||
      weather.maxWindSpeed > 35 ||
      (workEquipment.highVisibility && commuteTemp < 18))
  ) {
    if (bestOuterLayer) {
      selectedProtectionLayers.push(bestOuterLayer);
    }
  } else if (isVeryHot && rainDemandsWaterproof) {
    // Si pluie par forte chaleur (> 28°C), juste un coupe-vent d'appoint ultra-léger
    const lightWindbreaker =
      CLOTHING_CATALOG.find((c) => c.id === "acc-kway-appoint") ||
      CLOTHING_CATALOG.find((c) => c.id === "prot-coupe-vent-leger");
    if (lightWindbreaker) {
      selectedProtectionLayers.push(lightWindbreaker);
    }
  }

  // =========================================================================
  // RÈGLE N°1 & N°2 : TENUE DE BASE (POUR LA DESTINATION)
  // Dictée par l'environnement principal à destination & la formalité
  // =========================================================================
  const baseCandidates = CLOTHING_CATALOG.filter(
    (item) => item.section === "tenue_base" && matchesProfileAndFormality(item)
  );

  // Déterminer le niveau thermique idéal à destination
  // "Chauffé/Surchauffé" : 22-24°C ressenti intérieur -> vêtement léger (warmth 1 ou 2 max)
  // "Température Normale" : 19-21°C -> équilibré (warmth 2)
  // "Climatisé/Frais" : 17-19°C -> plus chaud (warmth 3 ou superposition amovible)
  // "Principalement en Extérieur" : aligné sur la température de l'après-midi
  let destinationWarmthTarget = 2;
  if (context.destinationEnvironment === "Chauffé/Surchauffé") {
    destinationWarmthTarget = 1;
  } else if (context.destinationEnvironment === "Climatisé/Frais") {
    destinationWarmthTarget = 3;
  } else if (context.destinationEnvironment === "Principalement en Extérieur") {
    if (effectiveFeltAfternoon <= 0) destinationWarmthTarget = 5;
    else if (effectiveFeltAfternoon < 8) destinationWarmthTarget = 4;
    else if (effectiveFeltAfternoon < 15) destinationWarmthTarget = 3;
    else if (effectiveFeltAfternoon < 24) destinationWarmthTarget = 2;
    else destinationWarmthTarget = 1;
  }

  // Si canicule / forte chaleur extérieure et non climatisé, la tenue doit être de chaleur 1
  if (isVeryHot && context.destinationEnvironment !== "Climatisé/Frais") {
    destinationWarmthTarget = 1;
  }

  // 0. Sous-vêtement / Première couche
  let selectedUnderwear: ClothingItem | undefined = undefined;
  if (profile.type === "Enfant" && (childAge ?? 3) < 3) {
    selectedUnderwear = CLOTHING_CATALOG.find((i) => i.id === "base-body-couche-bebe");
  } else if (isNegativeFreezing || (isColdOrFreezing && context.destinationEnvironment === "Principalement en Extérieur")) {
    // Par températures négatives, proposer une sous-couche thermique isolante
    selectedUnderwear = CLOTHING_CATALOG.find((i) => i.id === "base-sous-pull-thermique");
  }

  // 1. Haut de base
  const tops = baseCandidates.filter((i) =>
    ["Haut Formel", "Haut Léger", "Haut Chaud"].includes(i.subCategory)
  );

  let selectedTop: ClothingItem | undefined;

  if (isVeryHot) {
    // FORTE CHALEUR (> 28°C / 30°C) : Hauts ultra-respirants de warmthLevel 1 impérativement
    if (profile.type === "Enfant") {
      selectedTop =
        tops.find((t) => t.id === "base-tshirt-enfant-ete") ||
        tops.find((t) => t.id === "base-debardeur-top-ete") ||
        tops.find((t) => t.warmthLevel === 1);
    } else if (isSafetyContext) {
      selectedTop =
        tops.find((t) => t.id === "base-tshirt-travail-technique") ||
        tops.find((t) => t.id === "base-tshirt-coton");
    } else if (context.formality === "Formel/Strict" || context.formality === "Business Casual") {
      selectedTop =
        tops.find((t) => t.id === "base-chemisette-lin") ||
        tops.find((t) => t.id === "base-chemise-habillee") ||
        tops.find((t) => t.warmthLevel === 1);
    } else {
      selectedTop =
        tops.find((t) => t.id === "base-tshirt-premium") ||
        tops.find((t) => t.id === "base-debardeur-top-ete") ||
        tops.find((t) => t.id === "base-tshirt-coton") ||
        tops.find((t) => t.warmthLevel === 1);
    }
  } else if (isNegativeFreezing && context.destinationEnvironment === "Principalement en Extérieur") {
    // GRAND FROID EN EXTÉRIEUR : Haut chaud niveau 5
    selectedTop =
      tops.find((t) => t.id === "base-pull-grosse-maille-laine") ||
      tops.find((t) => t.warmthLevel === 5) ||
      tops.find((t) => t.id === "base-sweat-molleton");
  } else if (isNegativeFreezing) {
    // Grand froid trajet avec intérieur normal : pull chaud niveau 4 ou superposition
    selectedTop =
      tops.find((t) => t.id === "base-pull-laine") ||
      tops.find((t) => t.id === "base-sweat-molleton") ||
      tops.find((t) => t.warmthLevel >= 3);
  } else if (isSafetyContext) {
    selectedTop =
      destinationWarmthTarget <= 2
        ? tops.find((t) => t.id === "base-tshirt-travail-technique") ||
          tops.find((t) => t.id === "base-tshirt-coton")
        : tops.find((t) => t.id === "base-sweat-molleton") || tops[0];
  } else if (isCasualWorkContext) {
    selectedTop =
      tops.find((t) => t.id === "base-tshirt-premium") ||
      tops.find((t) => t.id === "base-tshirt-coton") ||
      tops.find((t) => t.warmthLevel === destinationWarmthTarget);
  } else {
    selectedTop = tops.find((t) => t.warmthLevel === destinationWarmthTarget);
  }

  if (!selectedTop) {
    selectedTop = [...tops].sort(
      (a, b) =>
        Math.abs(a.warmthLevel - destinationWarmthTarget) -
        Math.abs(b.warmthLevel - destinationWarmthTarget)
    )[0];
  }
  if (!selectedTop) {
    selectedTop = CLOTHING_CATALOG.find((i) => i.id === "base-tshirt-premium") ||
      CLOTHING_CATALOG.find((i) => i.id === "base-tshirt-coton")!;
  }

  // 2. Option de superposition amovible (surchemise ou cardigan)
  let layerOption: ClothingItem | undefined = undefined;
  const tempAmplitude = Math.abs(weather.morning.temp - weather.afternoon.temp);

  // Par forte chaleur (> 28°C), AUCUNE superposition sauf si bureau climatisé à 18°C (choc thermique)
  if (isVeryHot) {
    if (context.destinationEnvironment === "Climatisé/Frais") {
      layerOption = baseCandidates.find((i) => i.id === "base-cardigan-boutonne");
    }
  } else if (isNegativeFreezing) {
    // Par températures négatives, proposer une surchemise ou un cardigan en superposition chaude
    layerOption =
      baseCandidates.find((i) => i.id === "base-cardigan-boutonne") ||
      baseCandidates.find((i) => i.id === "base-surchemise-casual");
  } else if (
    isCasualWorkContext &&
    selectedTop.warmthLevel <= 2 &&
    (commuteTemp < 19 || tempAmplitude >= 6 || context.destinationEnvironment === "Climatisé/Frais")
  ) {
    layerOption =
      baseCandidates.find((i) => i.id === "base-surchemise-casual") ||
      baseCandidates.find((i) => i.id === "base-cardigan-boutonne");
  } else if (
    context.destinationEnvironment === "Climatisé/Frais" ||
    (tempAmplitude >= 8 && selectedTop.warmthLevel <= 2)
  ) {
    const cardigan =
      baseCandidates.find((i) => i.id === "base-cardigan-boutonne") ||
      baseCandidates.find((i) => i.id === "base-surchemise-casual");
    if (cardigan && cardigan.id !== selectedTop.id) {
      layerOption = cardigan;
    }
  }

  // 3. Bas de base - CONTRÔLE RIGOUREUX DE TEMPÉRATURE (Forte chaleur vs Températures négatives)
  const bottoms = baseCandidates.filter((i) =>
    ["Bas Formel", "Bas Léger", "Bas Chaud"].includes(i.subCategory)
  );
  let selectedBottom: ClothingItem | undefined;

  if (isVeryHot) {
    // -------------------------------------------------------------
    // FORTE CHALEUR (> 28°C / 30°C) :
    // INTERDICTION FORMELLE DE PROPOSER UN PANTALON CHAUD OU UN JEAN ÉPAIS !
    // -------------------------------------------------------------
    if (profile.type === "Enfant") {
      // Pour les enfants : short léger en coton ou jupe/robe d'été
      selectedBottom =
        bottoms.find((b) => b.id === "base-short-enfant-ete") ||
        bottoms.find((b) => b.id === "base-robe-jupe-ete") ||
        bottoms.find((b) => b.warmthLevel === 1);
    } else if (isSafetyContext || workEquipment.heavyDutyPants) {
      // Pour les chantiers/travail : pantalon de travail technique allégé d'été respirant
      selectedBottom =
        bottoms.find((b) => b.id === "base-pantalon-travail-ete") ||
        bottoms.find((b) => b.warmthLevel === 1);
    } else if (context.formality === "Formel/Strict" || context.formality === "Business Casual") {
      // Pour un cadre professionnel formel où le short n'est pas toléré : pantalon ultra-léger en lin & coton
      selectedBottom =
        bottoms.find((b) => b.id === "base-pantalon-lin-ete") ||
        bottoms.find((b) => b.id === "base-robe-jupe-ete") ||
        bottoms.find((b) => b.id === "base-pantalon-chino");
    } else {
      // Pour casual, décontracté ou sport : Short d'été respirant ou jupe légère
      selectedBottom =
        bottoms.find((b) => b.id === "base-short-bermuda-ete") ||
        bottoms.find((b) => b.id === "base-robe-jupe-ete") ||
        bottoms.find((b) => b.id === "base-pantalon-lin-ete") ||
        bottoms.find((b) => b.warmthLevel === 1);
    }
  } else if (isNegativeFreezing) {
    // -------------------------------------------------------------
    // TEMPÉRATURES NÉGATIVES / GRAND FROID (<= 0°C) :
    // INTERDICTION FORMELLE DE PROPOSER UN BAS LÉGER !
    // -------------------------------------------------------------
    if (profile.type === "Enfant") {
      selectedBottom =
        bottoms.find((b) => b.id === "base-pantalon-ski-enfant") ||
        bottoms.find((b) => b.id === "base-pantalon-chaud-hiver") ||
        bottoms.find((b) => b.warmthLevel >= 4);
    } else if (isSafetyContext || workEquipment.heavyDutyPants) {
      selectedBottom =
        bottoms.find((b) => b.id === "base-pantalon-travail-pro") ||
        bottoms.find((b) => b.id === "base-pantalon-chaud-hiver");
    } else {
      selectedBottom =
        bottoms.find((b) => b.id === "base-pantalon-chaud-hiver") ||
        bottoms.find((b) => b.warmthLevel >= 4) ||
        bottoms.find((b) => b.id === "base-jean-brut");
    }
  } else if (isSafetyContext || workEquipment.heavyDutyPants) {
    selectedBottom =
      bottoms.find((b) => b.id === "base-pantalon-travail-pro") ||
      bottoms.find((b) => b.id === "base-jean-brut") ||
      bottoms[0];
  } else if (isCasualWorkContext) {
    selectedBottom =
      bottoms.find((b) => b.id === "base-jean-brut") ||
      bottoms.find((b) => b.id === "base-pantalon-chino") ||
      bottoms[0];
  } else {
    selectedBottom = bottoms.find((b) => b.warmthLevel >= Math.min(2, destinationWarmthTarget));
  }

  if (!selectedBottom) {
    selectedBottom =
      bottoms[0] ||
      CLOTHING_CATALOG.find((i) => i.id === "base-jean-brut") ||
      CLOTHING_CATALOG.find((i) => i.id === "base-pantalon-chino")!;
  }

  // 4. Chaussures - ADAPTÉES À LA TEMPÉRATURE
  const shoes = baseCandidates.filter((i) => i.subCategory === "Chaussures");
  let selectedFootwear: ClothingItem;

  if (isSafetyContext || workEquipment.safetyShoes) {
    // Travailleurs : chaussures de sécurité obligatoires
    if (rainDemandsWaterproof || commuteTemp < 10 || effectiveFeltAfternoon < 12 || isNegativeFreezing) {
      selectedFootwear =
        shoes.find((s) => s.id === "shoes-securite-s3") ||
        CLOTHING_CATALOG.find((i) => i.id === "shoes-securite-s3")!;
    } else {
      selectedFootwear =
        shoes.find((s) => s.id === "shoes-securite-s1p") ||
        CLOTHING_CATALOG.find((i) => i.id === "shoes-securite-s1p")!;
    }
  } else if (isNegativeFreezing) {
    // Températures négatives : bottes fourrées isolées ou bottines chaudes montantes
    selectedFootwear =
      shoes.find((s) => s.id === "shoes-bottes-fourrees-neige") ||
      shoes.find((s) => s.id === "shoes-bottines-cuir") ||
      shoes.find((s) => s.warmthLevel >= 4) ||
      shoes[0];
  } else if (isVeryHot) {
    // Forte chaleur : sandales aérées ou baskets en toile d'été
    if (profile.type === "Enfant" && (childAge ?? 3) <= 6) {
      selectedFootwear =
        shoes.find((s) => s.id === "shoes-sandales-enfant") ||
        shoes.find((s) => s.id === "shoes-enfant-scratch") ||
        shoes[0];
    } else {
      selectedFootwear =
        shoes.find((s) => s.id === "shoes-sandales-marche") ||
        shoes.find((s) => s.id === "shoes-baskets-toile-ete") ||
        shoes.find((s) => s.warmthLevel === 1) ||
        shoes[0];
    }
  } else if (profile.type === "Enfant" && (childAge ?? 3) <= 6) {
    // Enfant <= 6 ans, scratchs sans lacets
    if (rainDemandsWaterproof) {
      selectedFootwear =
        shoes.find((s) => s.id === "shoes-bottes-pluie-enfant") ||
        shoes.find((s) => s.id === "shoes-enfant-scratch") ||
        shoes[0];
    } else {
      selectedFootwear =
        shoes.find((s) => s.id === "shoes-enfant-scratch") ||
        shoes.find((s) => s.id === "shoes-chaussons-bebe") ||
        shoes[0];
    }
  } else if (
    isCasualWorkContext ||
    clothingPrefs.prefersSneakers ||
    clothingPrefs.preferredStyle === "Casual (T-shirt & Baskets)"
  ) {
    selectedFootwear =
      shoes.find((s) => s.id === "shoes-sneakers-blanches-casual") ||
      shoes.find((s) => s.id === "shoes-sneakers-cuir") ||
      shoes[0];
  } else if (rainDemandsWaterproof || commuteTemp < 5) {
    selectedFootwear =
      shoes.find((s) => s.id === "shoes-bottines-cuir") ||
      shoes.find((s) => s.waterproofLevel >= 2) ||
      shoes[0];
  } else {
    selectedFootwear =
      shoes[0] ||
      CLOTHING_CATALOG.find((i) => i.id === "shoes-sneakers-blanches-casual") ||
      CLOTHING_CATALOG.find((i) => i.id === "shoes-sneakers-cuir")!;
  }

  if (!selectedFootwear) {
    selectedFootwear =
      profile.type === "Enfant"
        ? CLOTHING_CATALOG.find((i) => i.id === "shoes-enfant-scratch")!
        : CLOTHING_CATALOG.find((i) => i.id === "shoes-sneakers-blanches-casual")!;
  }

  // =========================================================================
  // RÈGLE N°3 : TRADUIRE L'INCERTITUDE EN CONSEIL (ACCESSOIRES & ALERTES)
  // Transformer les probabilités et incertitudes météo en conseils pratiques
  // =========================================================================
  const alerts: RecommendationOutput["accessoriesAndAlerts"] = [];

  // ALERTE FORTE CHALEUR & CANICULE (> 28°C / 30°C)
  if (isVeryHot) {
    const sunHat = CLOTHING_CATALOG.find((i) => i.id === "acc-casquette-chapeau-soleil");
    alerts.push({
      item: sunHat,
      title: "Alerte Forte Chaleur / Canicule (" + Math.round(maxDayTemp) + "°C max)",
      description:
        "La température dépasse les seuils de confort thermique. Évitez absolument les vêtements chauds et sombres : optez pour des matières ultra-légères et respirantes (coton fin, lin) de couleurs claires qui réfléchissent le rayonnement solaire. Couvrez-vous la tête pour prévenir tout risque d'insolation.",
      urgency: "alerte",
      iconName: "Sun",
    });

    const waterBottle = CLOTHING_CATALOG.find((i) => i.id === "acc-gourde-canicule");
    alerts.push({
      item: waterBottle,
      title: "Hydratation renforcée impérative",
      description:
        "Emportez une gourde d'eau fraîche avec vous et buvez régulièrement par petites gorgées tout au long de la journée, sans attendre la sensation de soif.",
      urgency: "conseil",
      iconName: "Sparkles",
    });
  }

  // ALERTE GRAND FROID & TEMPÉRATURES NÉGATIVES (<= 0°C)
  if (isNegativeFreezing) {
    const gloves = CLOTHING_CATALOG.find((i) => i.id === "acc-gants-ski-isolants");
    alerts.push({
      item: gloves,
      title: "Températures négatives & Risque de gel (" + Math.round(minDayTemp) + "°C ressentis)",
      description:
        "Le froid est intense et peut provoquer un engourdissement rapide des extrémités (doigts, orteils, oreilles). Gants thermiques isolants et chaussettes épaisses en laine mérinos sont indispensables dès la sortie du domicile.",
      urgency: "alerte",
      iconName: "Snowflake",
    });

    const beanie = CLOTHING_CATALOG.find((i) => i.id === "acc-bonnet-chaud");
    alerts.push({
      item: beanie,
      title: "Isolation thermique de la tête & du cou",
      description:
        "Jusqu'à 30% de la chaleur corporelle s'évacue par la tête. Le port d'un bonnet chaud et d'une écharpe montante protégeant la gorge est vivement recommandé.",
      urgency: "alerte",
      iconName: "Snowflake",
    });
  } else if (commuteTemp <= 5) {
    const scarf = CLOTHING_CATALOG.find((i) => i.id === "acc-echarpe-chaude");
    alerts.push({
      item: scarf,
      title: "Matinée fraîche à froide (" + Math.round(effectiveFeltMorning) + "°C ressenti)",
      description:
        "L'air du petit matin sera piquant. Une écharpe enveloppante et des gants permettront d'éviter les coups de froid pendant le déplacement.",
      urgency: "conseil",
      iconName: "Sparkles",
    });
  }

  // Incertitude Pluie
  if (weather.maxRainProb >= 60 || weather.summary.toLowerCase().includes("pluie")) {
    const umbrella = CLOTHING_CATALOG.find((i) => i.id === "acc-parapluie-robuste");
    alerts.push({
      item: umbrella,
      title: "Pluie très probable (jusqu'à " + weather.maxRainProb + "%)",
      description:
        "Des précipitations significatives sont attendues au cours de la journée. Emportez un parapluie solide et privilégiez des chaussures fermées.",
      urgency: "alerte",
      iconName: "CloudRain",
    });
  } else if (weather.maxRainProb >= 25 && weather.maxRainProb < 60) {
    const umbrellaPocket = CLOTHING_CATALOG.find((i) => i.id === "acc-parapluie-pliable");
    alerts.push({
      item: umbrellaPocket,
      title: "Risque d'averse modéré (" + weather.maxRainProb + "% de probabilité)",
      description:
        "Le ciel présente une incertitude : une ondée passagère n'est pas exclue dans l'après-midi. Glissez un parapluie compact ou un coupe-vent d'appoint dans votre sac pour ne pas vous faire surprendre.",
      urgency: "conseil",
      iconName: "Umbrella",
    });
  }

  // Indice UV & Soleil (si pas déjà affiché en canicule)
  if (weather.maxUvIndex >= 3 && !isVeryHot) {
    const sunglasses = CLOTHING_CATALOG.find((i) => i.id === "acc-lunettes-soleil");
    alerts.push({
      item: sunglasses,
      title: "Indice UV notable (" + weather.maxUvIndex + "/11)",
      description:
        "Luminosité importante en milieu de journée. Pensez aux lunettes de soleil protectrices, notamment pour la pause déjeuner en extérieur.",
      urgency: "info",
      iconName: "Sun",
    });
  }

  // Vent soutenu
  if (weather.maxWindSpeed >= 35) {
    alerts.push({
      title: "Rafales de vent sensibles (" + Math.round(weather.maxWindSpeed) + " km/h)",
      description:
        "Le vent accentue l'impression de fraîcheur. Privilégiez une capuche enveloppante plutôt qu'un parapluie fragile qui risquerait de se retourner.",
      urgency: "conseil",
      iconName: "Wind",
    });
  }

  // Forte amplitude thermique
  if (tempAmplitude >= 8) {
    alerts.push({
      title: "Forte amplitude thermique (+ " + Math.round(tempAmplitude) + "°C d'écart)",
      description:
        "Écart marqué entre le matin (" +
        weather.morning.temp +
        "°C) et l'après-midi (" +
        weather.afternoon.temp +
        "°C). La technique des couches superposables amovibles vous permettra de rester à l'aise toute la journée.",
      urgency: "info",
      iconName: "Layers",
    });
  }

  // Conseils spécifiques Enfants & Âge (Autonomie, couches & body, scratchs)
  let childSpecificAdvice: ChildSpecificAdvice | undefined = undefined;
  if (profile.type === "Enfant" && childAge !== undefined) {
    const isToddler = childAge < 3;
    childSpecificAdvice = {
      age: childAge,
      requiresDiaperAndBody: isToddler,
      shoesNotice:
        childAge <= 6
          ? "Chaussures à bandes scratchs (velcro) sans lacets : à cet âge, les enfants ne savent pas encore nouer leurs lacets seuls. L'école et la crèche exigent des chaussures faciles pour l'autonomie."
          : "Chaussures pratiques et solides adaptées aux cours de récréation et aux activités scolaires.",
      dressingNotice: isToddler
        ? "Bébé / Tout-petit (< 3 ans) : Port systématique d'un body en coton doux (manches longues ou courtes selon la fraîcheur) pour maintenir le ventre et le dos bien couverts sans remonter, avec couche propre et 1 à 2 changes complets dans le sac."
        : childAge <= 6
        ? "Pantalons souples à taille élastiquée recommandés pour faciliter le passage aux toilettes en autonomie à l'école maternelle sans boutons compliqués."
        : "Tenue adaptée aux mouvements et aux saisons d'école.",
    };

    if (isToddler) {
      alerts.unshift({
        title: "Bébé / Tout-petit (< 3 ans) : Body & Couches indispensables",
        description:
          "Pour les enfants de moins de 3 ans, le body en coton maintient le dos et le ventre bien au chaud sans remonter. Prévoir des couches de change et des vêtements souples faciles pour les changes fréquents.",
        urgency: "conseil",
        iconName: "Shirt",
      });
    } else if (childAge <= 6) {
      alerts.unshift({
        title: "École & Autonomie (3 à 6 ans) : Chaussures à scratchs",
        description:
          "À cet âge, l'enfant ne maîtrise pas encore les nœuds de lacets. Privilégiez impérativement des baskets ou chaussures fermées à scratchs (velcro) pour qu'il puisse se chausser et se déchausser seul sans aide.",
        urgency: "conseil",
        iconName: "Footprints",
      });
    }
  }

  // Conseils et alertes spécialisés Travailleurs & Équipements de Sécurité (EPI)
  let workEquipmentAdvice: RecommendationOutput["workEquipmentAdvice"] = undefined;
  if (
    isSafetyContext ||
    workEquipment.safetyShoes ||
    workEquipment.highVisibility ||
    workEquipment.heavyDutyPants ||
    workEquipment.workGloves
  ) {
    const isColdWeather = commuteTemp <= 9 || effectiveFeltAfternoon <= 10;
    const safetyShoesNotice = isColdWeather
      ? `Attention au pont thermique de la coque : par temps froid (${Math.round(commuteTemp)}°C ressenti), l'embout en acier ou composite conduit directement le froid extérieur vers les orteils. Portez impérativement des chaussettes thermiques épaisses (laine mérinos ou bouclette) et une semelle isolante pour éviter les engelures.`
      : `Températures douces (${Math.round(effectiveFeltAfternoon)}°C) : Dans des chaussures de sécurité coquées fermées, la transpiration est accélérée. Privilégiez des chaussettes techniques respirantes anti-frottements pour rester au sec toute la journée.`;

    const highVisNotice = workEquipment.highVisibility
      ? "Visibilité obligatoire (EPI classe 2/3) : Gilet fluo rétro-réfléchissant ou parka haute visibilité requis pour circuler ou intervenir sur le terrain."
      : undefined;

    const workWearNotice = workEquipment.heavyDutyPants
      ? "Pantalon de travail technique multipoches avec renforts anti-abrasion et poches outils adapté aux mouvements de travail."
      : undefined;

    workEquipmentAdvice = {
      safetyShoesNotice,
      highVisNotice,
      workWearNotice,
    };

    if (workEquipment.safetyShoes || isSafetyContext) {
      alerts.unshift({
        item: selectedFootwear,
        title: "Sécurité & Travail : Chaussures coquées et gestion thermique",
        description: safetyShoesNotice,
        urgency: isColdWeather ? "alerte" : "conseil",
        iconName: "ShieldAlert",
      });
    }

    if (workEquipment.highVisibility) {
      const gilet = CLOTHING_CATALOG.find((i) => i.id === "acc-gilet-haute-visibilite");
      alerts.unshift({
        item: gilet,
        title: "Sécurité & Chantier : Haute Visibilité obligatoire (EPI)",
        description:
          "Port du gilet jaune fluo ou de la parka normée EN ISO 20471 impératif pour être immédiatement repérable à distance de jour comme de nuit.",
        urgency: "alerte",
        iconName: "ShieldAlert",
      });
    }

    if (workEquipment.workGloves) {
      const gants = CLOTHING_CATALOG.find((i) => i.id === "acc-gants-manutention-chantier");
      alerts.push({
        item: gants,
        title: "Gants de protection & manutention",
        description:
          "Indispensables pour manipuler des matériaux ou des outils froids tout en évitant les risques d'abrasion et de coupure.",
        urgency: "conseil",
        iconName: "Hand",
      });
    }
  }

  // Notice de Style Casual au travail
  let casualStyleNotice: string | undefined = undefined;
  if (isCasualWorkContext) {
    casualStyleNotice =
      "Style Casual au travail : T-shirt uni soigné et baskets blanches ou sneakers de ville, complétés par une surchemise ou un gilet amovible pour s'adapter avec élégance à la fraîcheur du matin et à la température des locaux.";
  }

  // Justifications des 3 Règles d'Or pour la transparence
  const ruleJustifications = {
    rule1_dissociation: `Dissociation active : Couche extérieure choisie pour le trajet à ${commuteTemp}°C ressenti (${selectedProtectionLayers.map((p) => p.name).join(", ") || "Aucune couche lourde requise"}), tandis que la tenue intérieure (${selectedTop.name}) est calibrée pour l'environnement "${context.destinationEnvironment}".`,
    rule2_formality: `Filtre formel : Sélection alignée sur "${context.formality}"${isSafetyContext ? " avec équipements de protection (EPI)" : isCasualWorkContext ? " en mode Casual T-shirt & Baskets" : ""}.`,
    rule3_uncertainty:
      weather.maxRainProb >= 25
        ? `Incertitude traduite : Risque de pluie de ${weather.maxRainProb}% transformé en précaution concrète (${alerts.find((a) => a.iconName.includes("Cloud") || a.iconName === "Umbrella")?.title || "Prévoyez un abri"}).`
        : `Conditions stables : Pas d'aléa majeur détecté (pluie < 25%).`,
  };

  return {
    calculatedAt: new Date().toISOString(),
    effectiveFeltMorning,
    effectiveFeltAfternoon,
    effectiveFeltEvening,
    protectionLayers: selectedProtectionLayers,
    baseOutfit: {
      underwear: selectedUnderwear,
      top: selectedTop,
      layerOption,
      bottom: selectedBottom,
      footwear: selectedFootwear,
    },
    accessoriesAndAlerts: alerts,
    childSpecificAdvice,
    workEquipmentAdvice,
    casualStyleNotice,
    ruleJustifications,
  };
}
