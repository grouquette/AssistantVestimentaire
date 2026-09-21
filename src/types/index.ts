export type Gender = "Homme" | "Femme" | "Non-binaire";
export type UserType = "Adulte" | "Enfant";

export type FormalityLevel =
  | "Formel/Strict"
  | "Business Casual"
  | "Casual (T-shirt & Baskets)"
  | "Décontracté"
  | "Sport"
  | "Professionnel / Chantier & EPI";

export type DestinationEnvironment =
  | "Chauffé/Surchauffé"
  | "Température Normale"
  | "Climatisé/Frais"
  | "Principalement en Extérieur";

export interface WorkEquipment {
  safetyShoes?: boolean; // Chaussures de sécurité coquées obligatoires
  highVisibility?: boolean; // Gilet ou parka haute visibilité requis
  heavyDutyPants?: boolean; // Pantalon de travail technique multipoches
  workGloves?: boolean; // Gants de protection/manutention
}

export interface UserClothingPreferences {
  preferredStyle?:
    | "Casual (T-shirt & Baskets)"
    | "Smart Casual"
    | "Classique / Habillé"
    | "Workwear & Technique";
  prefersSneakers?: boolean; // Privilégie les baskets au quotidien
  prefersTshirts?: boolean; // Aime porter des T-shirts au travail
  prefersHoodies?: boolean; // Aime porter des sweats confortables
}

export interface LifeContext {
  id: string;
  name: string; // e.g. "Bureau formel", "Bureau Casual", "Chantier & Terrain", "Journée d'école"
  formality: FormalityLevel;
  destinationEnvironment: DestinationEnvironment;
  workEquipment?: WorkEquipment;
  isDefault?: boolean;
}

export interface LocationInfo {
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface UserProfile {
  id: string;
  name: string; // e.g. "Moi", "Papa", "Léo 7 ans"
  avatarColor: string;
  location: LocationInfo;
  gender: Gender;
  type: UserType;
  childAge?: number; // Âge en années pour un profil Enfant (0 = < 1 an / nourrisson, 1, 2, 3...)
  clothingPreferences?: UserClothingPreferences;
  defaultWorkEquipment?: WorkEquipment;
  /**
   * Thermal sensitivity slider: -3 ("Jamais froid") to +3 ("Très frileux")
   * 0 = normal/tempéré.
   * Acts as a modifier: a cold-sensitive person feels the air as colder (perceived temp = actual - modifier)
   */
  thermalSensitivity: number;
  contexts: LifeContext[];
  activeContextId: string;
}

export interface HourlyWeatherPoint {
  time: string; // ISO string
  hour: number;
  temp: number;
  apparentTemp: number;
  precipitationProb: number;
  precipitationMm: number;
  weatherCode: number;
  windSpeed: number; // km/h
  uvIndex: number;
  conditionDescription: string;
  iconName: string;
}

export interface DayMoments {
  morning: HourlyWeatherPoint; // Aller (approx 8h)
  afternoon: HourlyWeatherPoint; // Pic thermique (approx 14h)
  evening: HourlyWeatherPoint; // Retour (approx 18h)
  minTemp: number;
  maxTemp: number;
  maxRainProb: number;
  maxWindSpeed: number;
  maxUvIndex: number;
  summary: string;
}

export type ClothingSection = "couche_protection" | "tenue_base" | "accessoire_alerte";

export type ClothingSubCategory =
  | "Manteau"
  | "Veste"
  | "Imperméable"
  | "Haut Chaud"
  | "Haut Léger"
  | "Haut Formel"
  | "Bas Chaud"
  | "Bas Léger"
  | "Bas Formel"
  | "Chaussures"
  | "Accessoire";

export interface ClothingItem {
  id: string;
  name: string;
  section: ClothingSection;
  subCategory: ClothingSubCategory;
  warmthLevel: 1 | 2 | 3 | 4 | 5; // 1 = très léger (été), 5 = très chaud (grand froid)
  waterproofLevel: 0 | 1 | 2 | 3; // 0 = non, 1 = déperlant, 2 = résistant pluie, 3 = imperméable total
  windproof: boolean;
  allowedFormalities: FormalityLevel[];
  allowedTypes: ("Adulte" | "Enfant")[];
  allowedGenders: ("Homme" | "Femme" | "Non-binaire")[];
  minChildAge?: number; // Âge minimum recommandé pour un enfant (ex: 7 ans pour des baskets à lacets)
  maxChildAge?: number; // Âge maximum recommandé pour un enfant (ex: 2 ans pour les bodies et couches)
  iconName: string;
  description: string;
  tips?: string;
}

export interface ChildSpecificAdvice {
  age: number;
  requiresDiaperAndBody: boolean; // < 3 ans
  shoesNotice: string; // Ex: Chaussures à scratchs recommandées car pas de maîtrise des lacets
  dressingNotice: string; // Ex: Body et couches de change, pantalons à élastiques faciles
}

export interface WorkEquipmentAdvice {
  safetyShoesNotice?: string;
  highVisNotice?: string;
  workWearNotice?: string;
}

export interface RecommendationOutput {
  calculatedAt: string;
  effectiveFeltMorning: number;
  effectiveFeltAfternoon: number;
  effectiveFeltEvening: number;
  protectionLayers: ClothingItem[];
  baseOutfit: {
    underwear?: ClothingItem; // Body & couche pour les enfants < 3 ans
    top: ClothingItem;
    layerOption?: ClothingItem; // e.g. cardigan or pull easily removable
    bottom: ClothingItem;
    footwear: ClothingItem;
  };
  accessoriesAndAlerts: Array<{
    item?: ClothingItem;
    title: string;
    description: string;
    urgency: "info" | "conseil" | "alerte";
    iconName: string;
  }>;
  childSpecificAdvice?: ChildSpecificAdvice;
  workEquipmentAdvice?: WorkEquipmentAdvice;
  casualStyleNotice?: string;
  ruleJustifications: {
    rule1_dissociation: string;
    rule2_formality: string;
    rule3_uncertainty: string;
  };
}

export interface FeedbackRecord {
  id: string;
  profileId: string;
  date: string;
  contextName: string;
  rating: "positive" | "negative";
  tag?: "trop_chaud" | "trop_froid" | "trop_decontracte" | "trop_habille" | "parfait";
  comment?: string;
  sensitivityAdjusted?: boolean;
}

export interface PaletteColor {
  name: string;
  hex: string;
  role: string;
}

export interface StylistAnalysis {
  summary?: string;
  practicalTip?: string;
  vigilancePoint?: string;
  colorAdvice?: string;
  recommendedPalette?: PaletteColor[];
}
