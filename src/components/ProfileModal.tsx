import React, { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Search,
  Sliders,
  User,
  Trash2,
  Check,
  Building,
  Plus,
  Compass,
  AlertCircle,
  AlertTriangle,
  Baby,
  HardHat,
  Shirt,
  Footprints,
  ShieldAlert,
} from "lucide-react";
import {
  Gender,
  LifeContext,
  LocationInfo,
  UserClothingPreferences,
  UserProfile,
  UserType,
  WorkEquipment,
} from "../types";
import { searchLocations } from "../services/weatherService";
import { getThermalSensitivityLabel } from "../services/storageService";
import { validateProfileName } from "../utils/profanityFilter";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileToEdit?: UserProfile | null;
  onSaveProfile: (profile: UserProfile) => void;
  onDeleteProfile?: (id: string) => void;
  canDelete?: boolean;
}

const AVATAR_COLORS = [
  "from-blue-600 to-indigo-600",
  "from-purple-600 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-red-600",
  "from-cyan-500 to-blue-600",
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profileToEdit,
  onSaveProfile,
  onDeleteProfile,
  canDelete,
}) => {
  const [name, setName] = useState(profileToEdit?.name || "");
  const [nameError, setNameError] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender>(profileToEdit?.gender || "Femme");
  const [type, setType] = useState<UserType>(profileToEdit?.type || "Adulte");
  const [childAge, setChildAge] = useState<number>(profileToEdit?.childAge ?? 3);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [thermalSensitivity, setThermalSensitivity] = useState<number>(
    profileToEdit?.thermalSensitivity ?? 0
  );
  const [avatarColor, setAvatarColor] = useState(
    profileToEdit?.avatarColor || AVATAR_COLORS[0]
  );
  const [clothingPreferences, setClothingPreferences] = useState<UserClothingPreferences>(
    profileToEdit?.clothingPreferences || {
      preferredStyle: "Casual (T-shirt & Baskets)",
      prefersSneakers: true,
      prefersTshirts: true,
      prefersHoodies: false,
    }
  );
  const [defaultWorkEquipment, setDefaultWorkEquipment] = useState<WorkEquipment>(
    profileToEdit?.defaultWorkEquipment || {
      safetyShoes: false,
      highVisibility: false,
      heavyDutyPants: false,
      workGloves: false,
    }
  );
  const [location, setLocation] = useState<LocationInfo>(
    profileToEdit?.location || {
      name: "Paris",
      country: "France",
      admin1: "Île-de-France",
      latitude: 48.8566,
      longitude: 2.3522,
      timezone: "Europe/Paris",
    }
  );

  // City search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (profileToEdit) {
      setName(profileToEdit.name);
      setGender(profileToEdit.gender);
      setType(profileToEdit.type);
      setChildAge(profileToEdit.childAge ?? 3);
      setThermalSensitivity(profileToEdit.thermalSensitivity);
      setAvatarColor(profileToEdit.avatarColor);
      setLocation(profileToEdit.location);
      setClothingPreferences(
        profileToEdit.clothingPreferences || {
          preferredStyle: "Casual (T-shirt & Baskets)",
          prefersSneakers: true,
          prefersTshirts: true,
          prefersHoodies: false,
        }
      );
      setDefaultWorkEquipment(
        profileToEdit.defaultWorkEquipment || {
          safetyShoes: false,
          highVisibility: false,
          heavyDutyPants: false,
          workGloves: false,
        }
      );
    } else {
      setName("");
      setGender("Femme");
      setType("Adulte");
      setChildAge(3);
      setThermalSensitivity(0);
      setAvatarColor(AVATAR_COLORS[0]);
      setClothingPreferences({
        preferredStyle: "Casual (T-shirt & Baskets)",
        prefersSneakers: true,
        prefersTshirts: true,
        prefersHoodies: false,
      });
      setDefaultWorkEquipment({
        safetyShoes: false,
        highVisibility: false,
        heavyDutyPants: false,
        workGloves: false,
      });
      setLocation({
        name: "Paris",
        country: "France",
        admin1: "Île-de-France",
        latitude: 48.8566,
        longitude: 2.3522,
        timezone: "Europe/Paris",
      });
    }
    setSearchQuery("");
    setSearchResults([]);
    setNameError(null);
    setShowDeleteConfirm(false);
  }, [profileToEdit, isOpen]);

  const handleSearchCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const res = await searchLocations(searchQuery.trim());
    setSearchResults(res);
    setIsSearching(false);
  };

  const handleSelectCity = (loc: LocationInfo) => {
    setLocation(loc);
    setSearchResults([]);
    setSearchQuery("");
  };

  const thermalLabel = getThermalSensitivityLabel(thermalSensitivity);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateProfileName(name);
    if (error) {
      setNameError(error);
      return;
    }
    setNameError(null);

    const defaultContexts: LifeContext[] =
      type === "Enfant"
        ? [
            {
              id: "ctx-" + Date.now() + "-1",
              name: "Journée d'école & récréation",
              formality: "Décontracté",
              destinationEnvironment: "Température Normale",
              isDefault: true,
            },
            {
              id: "ctx-" + Date.now() + "-2",
              name: "Sortie parc & plein air",
              formality: "Sport",
              destinationEnvironment: "Principalement en Extérieur",
            },
          ]
        : [
            {
              id: "ctx-" + Date.now() + "-1",
              name: "Journée de travail",
              formality: "Business Casual",
              destinationEnvironment: "Température Normale",
              isDefault: true,
            },
            {
              id: "ctx-" + Date.now() + "-2",
              name: "Bureau formel & réunions",
              formality: "Formel/Strict",
              destinationEnvironment: "Chauffé/Surchauffé",
            },
            {
              id: "ctx-" + Date.now() + "-3",
              name: "Week-end détente",
              formality: "Décontracté",
              destinationEnvironment: "Principalement en Extérieur",
            },
          ];

    const updatedProfile: UserProfile = {
      id: profileToEdit ? profileToEdit.id : "profile-" + Date.now(),
      name: name.trim(),
      gender,
      type,
      childAge: type === "Enfant" ? childAge : undefined,
      thermalSensitivity,
      avatarColor,
      location,
      clothingPreferences,
      defaultWorkEquipment,
      contexts: profileToEdit ? profileToEdit.contexts : defaultContexts,
      activeContextId: profileToEdit
        ? profileToEdit.activeContextId
        : defaultContexts[0].id,
    };

    onSaveProfile(updatedProfile);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-4 sm:p-7 shadow-2xl border border-amber-200/80 my-auto max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between pb-3.5 border-b border-amber-100 mb-3 sm:mb-4 shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
              <span>{type === "Enfant" ? "🧒" : "👨‍👩‍👧"}</span>
              {profileToEdit ? `Modifier le profil de ${profileToEdit.name}` : "Nouveau membre de la famille"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Personnalisez l'identité, le lieu météo et la sensibilité thermique.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-4">
          {/* Identité : Nom & Avatar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nom ou Surnom
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) {
                    setNameError(validateProfileName(e.target.value));
                  }
                }}
                placeholder="Ex: Moi, Papa, Léo 7 ans..."
                required
                className={`w-full text-sm px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
                  nameError
                    ? "border-rose-300 focus:ring-rose-500 bg-rose-50/30"
                    : "border-slate-300 focus:ring-indigo-500"
                }`}
              />
              {nameError && (
                <div className="flex items-start gap-1.5 mt-1.5 text-xs text-rose-600 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{nameError}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Couleur d'avatar
              </label>
              <div className="flex items-center gap-2 pt-1">
                {AVATAR_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setAvatarColor(col)}
                    className={`w-7 h-7 rounded-full bg-gradient-to-r ${col} cursor-pointer transition-transform ${
                      avatarColor === col ? "ring-2 ring-indigo-600 ring-offset-2 scale-110" : ""
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Données Personnelles : Type (Adulte / Enfant) & Genre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Type de profil
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["Adulte", "Enfant"] as UserType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      type === t
                        ? "bg-indigo-50 border-indigo-600 text-indigo-900 ring-1 ring-indigo-600"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Genre
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["Homme", "Femme", "Non-binaire"] as Gender[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2 px-1 text-center text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      gender === g
                        ? "bg-indigo-50 border-indigo-600 text-indigo-900 ring-1 ring-indigo-600"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Âge de l'enfant (Prise en compte des couches/body et chaussures à scratchs) */}
          {type === "Enfant" && (
            <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Baby className="w-4 h-4 text-indigo-600" />
                  <span>Âge de l'enfant</span>
                </label>
                <span className="text-xs font-bold text-indigo-800 bg-white px-2.5 py-0.5 rounded-full border border-indigo-300 shadow-2xs">
                  {childAge < 1
                    ? "Moins d'un an (Nourrisson)"
                    : childAge === 1
                    ? "1 an (Bébé)"
                    : childAge === 2
                    ? "2 ans (Tout-petit)"
                    : `${childAge} ans ${childAge <= 6 ? "(Maternelle)" : "(Primaire / Collège)"}`}
                </span>
              </div>

              {/* Sélecteur d'âge en boutons rapides */}
              <div className="flex flex-wrap gap-1.5">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((age) => (
                  <button
                    key={age}
                    type="button"
                    onClick={() => setChildAge(age)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      childAge === age
                        ? "bg-indigo-600 text-white shadow-xs scale-105"
                        : "bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                    }`}
                  >
                    {age === 0 ? "<1" : age}
                  </button>
                ))}
              </div>

              {/* Explications et règles d'or adaptées à l'âge */}
              <div className="text-[11px] leading-relaxed rounded-lg p-2.5 bg-white border border-indigo-200/80 text-slate-700">
                {childAge < 3 ? (
                  <div className="space-y-1">
                    <span className="font-bold text-indigo-900 block">
                      👶 Moins de 3 ans : Body & Couches automatiques
                    </span>
                    <p className="text-slate-600">
                      À cet âge, l'enfant porte un body en coton (fermeture par pressions à l'entrejambe) pour garder le ventre et le dos bien couverts sans remonter, avec couches et chaussons/chaussures souples premier âge sans aucun lacet.
                    </p>
                  </div>
                ) : childAge <= 6 ? (
                  <div className="space-y-1">
                    <span className="font-bold text-indigo-900 block">
                      🧒 3 à 6 ans (Maternelle) : Chaussures à scratchs indispensables
                    </span>
                    <p className="text-slate-600">
                      À cet âge, les enfants ne savent pas nouer leurs lacets seuls. L'école préconise des chaussures ou baskets à scratchs (velcro) sans lacets pour favoriser l'autonomie et éviter les chutes.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span className="font-bold text-indigo-900 block">
                      🎒 7 ans et plus : Baskets et tenues d'école
                    </span>
                    <p className="text-slate-600">
                      L'enfant sait nouer ses lacets et gagne en indépendance pour les couches de vêtements et la météo de la cour de récréation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Style vestimentaire & Équipements professionnels (Adultes) */}
          {type === "Adulte" && (
            <div className="space-y-3">
              {/* Préférences vestimentaires & Style au travail */}
              <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Shirt className="w-4 h-4 text-teal-700" />
                    <span>Style vestimentaire & Habitudes au travail</span>
                  </label>
                  <span className="text-[11px] font-semibold text-teal-800 bg-white px-2 py-0.5 rounded-full border border-teal-200">
                    {clothingPreferences.preferredStyle || "Casual (T-shirt & Baskets)"}
                  </span>
                </div>

                <p className="text-[11px] text-teal-900/80">
                  Adapte les recommandations selon ce que vous aimez porter pour aller travailler (T-shirts de qualité, baskets confortables, ou style plus habillé).
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setClothingPreferences((prev) => ({
                        ...prev,
                        preferredStyle: "Casual (T-shirt & Baskets)",
                        prefersSneakers: true,
                        prefersTshirts: true,
                      }))
                    }
                    className={`text-xs p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                      clothingPreferences.preferredStyle === "Casual (T-shirt & Baskets)"
                        ? "bg-white border-teal-600 text-teal-950 font-bold ring-1 ring-teal-600 shadow-2xs"
                        : "bg-white/60 border-teal-200/80 text-teal-900 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <Footprints className="w-3.5 h-3.5 text-teal-600" />
                      <span>Casual (T-shirt & Baskets)</span>
                    </div>
                    <p className="text-[10px] text-teal-700 font-normal mt-0.5">
                      T-shirt en coton soigné & baskets citadines pour travailler
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setClothingPreferences((prev) => ({
                        ...prev,
                        preferredStyle: "Classique & Chemise",
                        prefersSneakers: false,
                        prefersTshirts: false,
                      }))
                    }
                    className={`text-xs p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                      clothingPreferences.preferredStyle === "Classique & Chemise"
                        ? "bg-white border-teal-600 text-teal-950 font-bold ring-1 ring-teal-600 shadow-2xs"
                        : "bg-white/60 border-teal-200/80 text-teal-900 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <Shirt className="w-3.5 h-3.5 text-teal-600" />
                      <span>Classique & Chemise</span>
                    </div>
                    <p className="text-[10px] text-teal-700 font-normal mt-0.5">
                      Chemises, polos et chaussures de ville en cuir
                    </p>
                  </button>
                </div>

                {/* Options fines */}
                <div className="pt-2 border-t border-teal-200/60 flex flex-col sm:flex-row gap-2.5">
                  <label className="flex items-center gap-2 text-xs font-medium text-teal-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={clothingPreferences.prefersTshirts}
                      onChange={(e) =>
                        setClothingPreferences((prev) => ({
                          ...prev,
                          prefersTshirts: e.target.checked,
                        }))
                      }
                      className="rounded border-teal-300 text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                    />
                    <span>Porte souvent des T-shirts pour travailler</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-teal-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={clothingPreferences.prefersSneakers}
                      onChange={(e) =>
                        setClothingPreferences((prev) => ({
                          ...prev,
                          prefersSneakers: e.target.checked,
                        }))
                      }
                      className="rounded border-teal-300 text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                    />
                    <span>Préfère les baskets / sneakers au travail</span>
                  </label>
                </div>
              </div>

              {/* Équipements spécifiques de travail (EPI / Chaussures de sécurité) */}
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                    <HardHat className="w-4 h-4 text-amber-700" />
                    <span>Équipements professionnels spécifiques (EPI)</span>
                  </label>
                  {(defaultWorkEquipment.safetyShoes || defaultWorkEquipment.highVisibility) && (
                    <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                      EPI Actifs
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-amber-900/80">
                  Cochez si votre métier impose des équipements de sécurité pour obtenir des conseils météo sur le froid dans les coques de sécurité, les semelles isolantes et la visibilité.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-800 bg-white p-2 rounded-lg border border-amber-200 cursor-pointer hover:bg-amber-50/50">
                    <input
                      type="checkbox"
                      checked={Boolean(defaultWorkEquipment.safetyShoes)}
                      onChange={(e) =>
                        setDefaultWorkEquipment((prev) => ({
                          ...prev,
                          safetyShoes: e.target.checked,
                        }))
                      }
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">🥾 Chaussures de sécurité</div>
                      <div className="text-[10px] text-slate-500">Coque acier/composite & semelle anti-perforation</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-800 bg-white p-2 rounded-lg border border-amber-200 cursor-pointer hover:bg-amber-50/50">
                    <input
                      type="checkbox"
                      checked={Boolean(defaultWorkEquipment.highVisibility)}
                      onChange={(e) =>
                        setDefaultWorkEquipment((prev) => ({
                          ...prev,
                          highVisibility: e.target.checked,
                        }))
                      }
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">🦺 Haute Visibilité</div>
                      <div className="text-[10px] text-slate-500">Gilet ou parka fluo rétro-réfléchissante</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-800 bg-white p-2 rounded-lg border border-amber-200 cursor-pointer hover:bg-amber-50/50">
                    <input
                      type="checkbox"
                      checked={Boolean(defaultWorkEquipment.heavyDutyPants)}
                      onChange={(e) =>
                        setDefaultWorkEquipment((prev) => ({
                          ...prev,
                          heavyDutyPants: e.target.checked,
                        }))
                      }
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">👖 Pantalon de chantier</div>
                      <div className="text-[10px] text-slate-500">Tissu résistant & poches techniques</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-800 bg-white p-2 rounded-lg border border-amber-200 cursor-pointer hover:bg-amber-50/50">
                    <input
                      type="checkbox"
                      checked={Boolean(defaultWorkEquipment.workGloves)}
                      onChange={(e) =>
                        setDefaultWorkEquipment((prev) => ({
                          ...prev,
                          workGloves: e.target.checked,
                        }))
                      }
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">🧤 Gants de protection</div>
                      <div className="text-[10px] text-slate-500">Manutention & protection thermique</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Localisation : Ville principale pour la météo */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                Lieu de vie principal (Météo)
              </label>
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {location.name} ({location.country})
              </span>
            </div>

            {/* City search input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une autre ville (ex: Lyon, Bordeaux, Bruxelles...)"
                className="flex-1 text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleSearchCity}
                disabled={isSearching}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <Search className="w-3 h-3" />
                <span>{isSearching ? "..." : "Chercher"}</span>
              </button>
            </div>

            {/* Search results dropdown */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white border border-slate-200 rounded-lg shadow-sm divide-y divide-slate-100 max-h-40 overflow-y-auto">
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectCity(res)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 flex items-center justify-between cursor-pointer"
                  >
                    <span className="font-semibold text-slate-800">
                      {res.name} {res.admin1 ? `(${res.admin1})` : ""}
                    </span>
                    <span className="text-slate-400">{res.country}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sensibilité Thermique : Curseur allant de "Jamais froid" à "Très frileux" */}
          <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                Sensibilité Thermique Personnelle
              </label>
              <span className="text-xs font-extrabold text-indigo-900 bg-white px-2 py-0.5 rounded-md border border-indigo-200 shadow-2xs">
                {thermalLabel.badge}
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Curseur modificateur : recalibre la température ressentie des prévisions pour adapter l'épaisseur des couches.
            </p>

            <input
              type="range"
              min="-3"
              max="3"
              step="1"
              value={thermalSensitivity}
              onChange={(e) => setThermalSensitivity(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-600 cursor-pointer"
            />

            <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
              <span>Jamais froid (-3)</span>
              <span>Tempéré (0)</span>
              <span>Très frileux (+3)</span>
            </div>

            <div className="mt-3 p-2.5 rounded-lg bg-white border border-indigo-200/80 text-xs">
              <div className="font-bold text-indigo-950">{thermalLabel.label}</div>
              <div className="text-[11px] text-slate-600 mt-0.5">{thermalLabel.effect}</div>
            </div>
          </div>
        </div>

        {/* Action buttons & Deletion confirmation (sticky footer) */}
        <div className="shrink-0 pt-3 border-t border-slate-100 mt-2">
          {showDeleteConfirm && profileToEdit && onDeleteProfile ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-rose-900">
                    Êtes-vous sûr de vouloir supprimer ce profil ?
                  </h4>
                  <p className="text-xs text-rose-700 mt-1">
                    Cette action supprimera définitivement le profil de <strong>{profileToEdit.name}</strong> ainsi que ses préférences et ses contextes de vie associés.
                  </p>
                  <div className="flex items-center gap-2 mt-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteProfile(profileToEdit.id);
                        setShowDeleteConfirm(false);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                      Oui, supprimer ce profil
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              {canDelete && profileToEdit && onDeleteProfile ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 cursor-pointer p-1 rounded hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Supprimer ce profil</span>
                  <span className="sm:hidden">Supprimer</span>
                </button>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 sm:px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 sm:px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-xs cursor-pointer transition-all hover:scale-102"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  </div>
);
};
