/**
 * Profanity filter utility to prevent offensive, vulgar, or inappropriate profile names.
 */

// Normalized bad words (lowercase, without accents or special characters)
const PROFANITY_LIST = [
  // Français - vulgarités & insultes
  "merde",
  "con",
  "conne",
  "connard",
  "connasse",
  "pute",
  "salope",
  "salop",
  "salaud",
  "encule",
  "enculee",
  "enculer",
  "batard",
  "batarde",
  "nique",
  "niquer",
  "ntm",
  "fdp",
  "fils de pute",
  "bite",
  "couille",
  "couilles",
  "bordel",
  "chier",
  "chiant",
  "trouduc",
  "trouducu",
  "trou du cul",
  "petasse",
  "pouffiasse",
  "tafiole",
  "tapette",
  "pd",
  "gouine",
  "negre",
  "bougnoule",
  "youpin",
  "boche",
  "fion",
  "clito",
  "vagin",
  "penis",
  "sexe",
  "baise",
  "baiser",
  "baisodrome",
  "branleur",
  "branleuse",
  "branler",
  "sucer",
  "suceur",
  "suceuse",
  "abruti",
  "crevard",
  "degage",
  "gueule",
  "ferme ta gueule",
  "tg",
  "cul",

  // Anglais - vulgarités communes
  "fuck",
  "fucker",
  "fucking",
  "shit",
  "bitch",
  "asshole",
  "cunt",
  "dick",
  "cock",
  "pussy",
  "bastard",
  "slut",
  "whore",
  "nigger",
  "nigga",
  "retard",
  "motherfucker",
  "wanker",
];

// Helper to normalize strings: removes accents, lowers case, replaces common leet speak
function normalizeText(text: string): string {
  let normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // strip accents

  // Common leetspeak substitutions
  normalized = normalized
    .replace(/[@4]/g, "a")
    .replace(/[3]/g, "e")
    .replace(/[1!|]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/[5$]/g, "s")
    .replace(/[7]/g, "t")
    .replace(/[8]/g, "b");

  return normalized;
}

/**
 * Checks if a string contains offensive or vulgar words.
 * Returns true if inappropriate, false otherwise.
 */
export function isProfane(text: string): boolean {
  if (!text || !text.trim()) return false;

  const normalized = normalizeText(text);

  // Strip non-alphanumeric for dense matching (e.g. "m.e.r.d.e" or "p-u-t-e")
  const strippedAlpha = normalized.replace(/[^a-z0-9]/g, "");

  // Split into tokens
  const words = normalized.split(/[\s\-_,.:;!?/\\()\[\]{}'"]+/).filter(Boolean);

  for (const bad of PROFANITY_LIST) {
    // 1. Exact token match
    if (words.includes(bad)) {
      return true;
    }

    // 2. Continuous dense substring match for words with at least 4 characters
    // (avoids short false positives like 'con' inside 'reconcilier')
    if (bad.length >= 4 && strippedAlpha.includes(bad)) {
      return true;
    }

    // 3. For short words (e.g., 'con', 'pd', 'tg', 'cul'), only match as isolated words or word boundaries
    if (bad.length < 4) {
      const regex = new RegExp(`\\b${bad}\\b`, "i");
      if (regex.test(normalized)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Returns a user-friendly error message if the name is profane, or null if valid.
 */
export function validateProfileName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return "Le nom ne peut pas être vide.";
  }

  if (trimmed.length < 2) {
    return "Le nom doit comporter au moins 2 caractères.";
  }

  if (trimmed.length > 30) {
    return "Le nom ne peut pas dépasser 30 caractères.";
  }

  if (isProfane(trimmed)) {
    return "Ce nom contient un terme inapproprié ou vulgaire. Veuillez choisir un prénom ou surnom respectueux.";
  }

  return null;
}
