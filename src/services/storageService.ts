import { FeedbackRecord, LifeContext, UserProfile } from "../types";

const PROFILES_KEY = "meteo_vestimentaire_profiles_v1";
const ACTIVE_PROFILE_KEY = "meteo_vestimentaire_active_id_v1";
const FEEDBACKS_KEY = "meteo_vestimentaire_feedbacks_v1";

export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: "profile-moi",
    name: "Maman",
    avatarColor: "from-rose-500 to-pink-600",
    location: {
      name: "Paris",
      country: "France",
      admin1: "Île-de-France",
      latitude: 48.8566,
      longitude: 2.3522,
      timezone: "Europe/Paris",
    },
    gender: "Femme",
    type: "Adulte",
    thermalSensitivity: 1, // Légèrement frileuse
    clothingPreferences: {
      preferredStyle: "Casual (T-shirt & Baskets)",
      prefersSneakers: true,
      prefersTshirts: true,
      prefersHoodies: false,
    },
    contexts: [
      {
        id: "ctx-casual-travail",
        name: "Bureau Casual (T-shirt & Baskets)",
        formality: "Casual (T-shirt & Baskets)",
        destinationEnvironment: "Température Normale",
        isDefault: true,
      },
      {
        id: "ctx-bureau-formel",
        name: "Bureau formel & Réunions",
        formality: "Formel/Strict",
        destinationEnvironment: "Chauffé/Surchauffé",
      },
      {
        id: "ctx-business-casual",
        name: "Smart / Business Casual",
        formality: "Business Casual",
        destinationEnvironment: "Température Normale",
      },
      {
        id: "ctx-weekend-parc",
        name: "Sortie Parc en Famille",
        formality: "Décontracté",
        destinationEnvironment: "Principalement en Extérieur",
      },
    ],
    activeContextId: "ctx-casual-travail",
  },
  {
    id: "profile-papa",
    name: "Papa (Technicien)",
    avatarColor: "from-amber-600 to-orange-600",
    location: {
      name: "Lyon",
      country: "France",
      admin1: "Auvergne-Rhône-Alpes",
      latitude: 45.764,
      longitude: 4.8357,
      timezone: "Europe/Paris",
    },
    gender: "Homme",
    type: "Adulte",
    thermalSensitivity: -1, // Peu frileux
    clothingPreferences: {
      preferredStyle: "Workwear & Technique",
      prefersSneakers: true,
      prefersTshirts: true,
    },
    defaultWorkEquipment: {
      safetyShoes: true,
      highVisibility: true,
      heavyDutyPants: true,
      workGloves: true,
    },
    contexts: [
      {
        id: "ctx-papa-chantier",
        name: "Chantier & Terrain (Chaussures sécurité & EPI)",
        formality: "Professionnel / Chantier & EPI",
        destinationEnvironment: "Principalement en Extérieur",
        workEquipment: {
          safetyShoes: true,
          highVisibility: true,
          heavyDutyPants: true,
          workGloves: true,
        },
        isDefault: true,
      },
      {
        id: "ctx-papa-casual",
        name: "Atelier & Bureau Casual (T-shirt & Baskets)",
        formality: "Casual (T-shirt & Baskets)",
        destinationEnvironment: "Température Normale",
      },
      {
        id: "ctx-papa-bureau",
        name: "Bureau & Rdv clients",
        formality: "Business Casual",
        destinationEnvironment: "Climatisé/Frais",
      },
      {
        id: "ctx-papa-deplacement",
        name: "Week-end & Loisirs",
        formality: "Décontracté",
        destinationEnvironment: "Principalement en Extérieur",
      },
    ],
    activeContextId: "ctx-papa-chantier",
  },
  {
    id: "profile-leo",
    name: "Léo 7 ans",
    avatarColor: "from-emerald-500 to-teal-600",
    location: {
      name: "Paris",
      country: "France",
      admin1: "Île-de-France",
      latitude: 48.8566,
      longitude: 2.3522,
      timezone: "Europe/Paris",
    },
    gender: "Homme",
    type: "Enfant",
    childAge: 7, // 7 ans
    thermalSensitivity: -2, // Bouge beaucoup, jamais très froid
    contexts: [
      {
        id: "ctx-leo-ecole",
        name: "Journée d'école & récréation",
        formality: "Décontracté",
        destinationEnvironment: "Température Normale",
        isDefault: true,
      },
      {
        id: "ctx-leo-sport",
        name: "Mercredi sport & jeux au parc",
        formality: "Sport",
        destinationEnvironment: "Principalement en Extérieur",
      },
      {
        id: "ctx-leo-fete",
        name: "Fête de famille habillée",
        formality: "Business Casual",
        destinationEnvironment: "Chauffé/Surchauffé",
      },
    ],
    activeContextId: "ctx-leo-ecole",
  },
  {
    id: "profile-emma",
    name: "Emma 2 ans",
    avatarColor: "from-purple-500 to-indigo-500",
    location: {
      name: "Paris",
      country: "France",
      admin1: "Île-de-France",
      latitude: 48.8566,
      longitude: 2.3522,
      timezone: "Europe/Paris",
    },
    gender: "Femme",
    type: "Enfant",
    childAge: 2, // 2 ans (Bébé / Crèche / Maternelle)
    thermalSensitivity: 2, // Frileuse, petits bouts de doigts vite froids
    contexts: [
      {
        id: "ctx-emma-creche",
        name: "Journée crèche & nounou",
        formality: "Décontracté",
        destinationEnvironment: "Température Normale",
        isDefault: true,
      },
      {
        id: "ctx-emma-poussette",
        name: "Balade en poussette & parc",
        formality: "Décontracté",
        destinationEnvironment: "Principalement en Extérieur",
      },
    ],
    activeContextId: "ctx-emma-creche",
  },
];

export function getStoredProfiles(): UserProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (!raw) {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(DEFAULT_PROFILES));
      return DEFAULT_PROFILES;
    }
    const parsed: UserProfile[] = JSON.parse(raw);
    const updated = parsed.map((p) => {
      if (p.type === "Enfant" && p.childAge === undefined) {
        // Détecter l'âge dans le nom ou défaut 3 ans
        const match = p.name.match(/(\d+)\s*ans?/i);
        return {
          ...p,
          childAge: match ? parseInt(match[1], 10) : 3,
        };
      }
      return p;
    });

    // Si Emma (bébé/crèche) n'existe pas encore dans les profils d'origine, on l'ajoute pour enrichir la famille
    const hasEmma = updated.some((p) => p.id === "profile-emma" || p.name.toLowerCase().includes("emma"));
    if (!hasEmma && updated.length <= 3) {
      const emma = DEFAULT_PROFILES.find((p) => p.id === "profile-emma");
      if (emma) {
        updated.push(emma);
        localStorage.setItem(PROFILES_KEY, JSON.stringify(updated));
      }
    }

    return updated;
  } catch (e) {
    console.error("Error reading profiles from localStorage:", e);
    return DEFAULT_PROFILES;
  }
}

export function saveProfiles(profiles: UserProfile[]): void {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.error("Error saving profiles to localStorage:", e);
  }
}

export function getActiveProfileId(): string {
  try {
    const active = localStorage.getItem(ACTIVE_PROFILE_KEY);
    if (active) return active;
    return DEFAULT_PROFILES[0].id;
  } catch {
    return DEFAULT_PROFILES[0].id;
  }
}

export function saveActiveProfileId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_PROFILE_KEY, id);
  } catch (e) {
    console.error("Error saving active profile ID:", e);
  }
}

export function getStoredFeedbacks(): FeedbackRecord[] {
  try {
    const raw = localStorage.getItem(FEEDBACKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveFeedback(feedback: FeedbackRecord): void {
  try {
    const all = getStoredFeedbacks();
    all.unshift(feedback);
    localStorage.setItem(FEEDBACKS_KEY, JSON.stringify(all.slice(0, 50)));
  } catch (e) {
    console.error("Error saving feedback:", e);
  }
}

export function getThermalSensitivityLabel(val: number): {
  label: string;
  badge: string;
  effect: string;
} {
  switch (val) {
    case -3:
      return {
        label: "Jamais froid (Guerrier polaire)",
        badge: "-4.5°C perçu",
        effect: "Perçoit les températures beaucoup plus chaudes qu'elles ne le sont",
      };
    case -2:
      return {
        label: "Résistant au froid",
        badge: "-3°C perçu",
        effect: "Supporte bien la fraîcheur sans avoir besoin de grosses couches",
      };
    case -1:
      return {
        label: "Peu frileux",
        badge: "-1.5°C perçu",
        effect: "Préfère des tenues légèrement plus aérées",
      };
    case 0:
      return {
        label: "Normal / Tempéré",
        badge: "± 0°C",
        effect: "Ressenti météo standard conforme au thermomètre",
      };
    case 1:
      return {
        label: "Légèrement frileux",
        badge: "+1.5°C de besoin",
        effect: "Sensible aux brises fraîches et aux pièces mal isolées",
      };
    case 2:
      return {
        label: "Frileux",
        badge: "+3°C de besoin",
        effect: "A besoin d'une couche supplémentaire dès que le vent souffle",
      };
    case 3:
      return {
        label: "Très frileux (Grand besoin de chaleur)",
        badge: "+4.5°C de besoin",
        effect: "Exige des vêtements bien isolants et fermés",
      };
    default:
      return {
        label: "Normal",
        badge: "0°C",
        effect: "Ressenti standard",
      };
  }
}
