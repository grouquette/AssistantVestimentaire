import React, { useState } from "react";
import { X, MapPin, Search, Check, Globe } from "lucide-react";
import { LocationInfo, UserProfile } from "../types";
import { searchLocations } from "../services/weatherService";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveLocation: (newLocation: LocationInfo) => void;
}

const POPULAR_CITIES: LocationInfo[] = [
  { name: "Paris", country: "France", admin1: "Île-de-France", latitude: 48.8566, longitude: 2.3522, timezone: "Europe/Paris" },
  { name: "Lyon", country: "France", admin1: "Auvergne-Rhône-Alpes", latitude: 45.764, longitude: 4.8357, timezone: "Europe/Paris" },
  { name: "Marseille", country: "France", admin1: "Provence-Alpes-Côte d'Azur", latitude: 43.2965, longitude: 5.3698, timezone: "Europe/Paris" },
  { name: "Bordeaux", country: "France", admin1: "Nouvelle-Aquitaine", latitude: 44.8378, longitude: -0.5792, timezone: "Europe/Paris" },
  { name: "Lille", country: "France", admin1: "Hauts-de-France", latitude: 50.6292, longitude: 3.0573, timezone: "Europe/Paris" },
  { name: "Nantes", country: "France", admin1: "Pays de la Loire", latitude: 47.2184, longitude: -1.5536, timezone: "Europe/Paris" },
  { name: "Toulouse", country: "France", admin1: "Occitanie", latitude: 43.6047, longitude: 1.4442, timezone: "Europe/Paris" },
  { name: "Strasbourg", country: "France", admin1: "Grand Est", latitude: 48.5734, longitude: 7.7521, timezone: "Europe/Paris" },
  { name: "Bruxelles", country: "Belgique", admin1: "Bruxelles-Capitale", latitude: 50.8503, longitude: 4.3517, timezone: "Europe/Brussels" },
  { name: "Genève", country: "Suisse", admin1: "Genève", latitude: 46.2044, longitude: 6.1432, timezone: "Europe/Zurich" },
];

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveLocation,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await searchLocations(trimmed);
      setResults(res);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (loc: LocationInfo) => {
    onSaveLocation(loc);
    onClose();
    setQuery("");
    setResults([]);
    setHasSearched(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-xl border border-slate-200 my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Changer la ville météo
              </h3>
              <p className="text-xs text-slate-500">
                Pour le profil de <span className="font-semibold text-slate-700">{profile.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {/* Current Location Badge */}
          <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Globe className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">Ville actuellement active :</span>
            <span className="font-bold text-slate-900">
              {profile.location.name} ({profile.location.country})
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active
          </span>
        </div>

        {/* Search input form */}
        <form onSubmit={handleSearch} className="mb-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Rechercher une ville en France ou dans le monde
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: Marseille, Nantes, Annecy, Bruxelles..."
                autoFocus
                className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              {isSearching ? (
                <span>Recherche...</span>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Trouver</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Search Results */}
        {hasSearched && (
          <div className="mb-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Résultats de recherche ({results.length})
            </h4>
            {results.length > 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {results.map((item, idx) => {
                  const isCurrent =
                    item.name.toLowerCase() === profile.location.name.toLowerCase() &&
                    item.country.toLowerCase() === profile.location.country.toLowerCase();
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-indigo-50/80 flex items-center justify-between transition-colors cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-800">{item.name}</span>
                          {item.admin1 && (
                            <span className="text-slate-500 ml-1.5">({item.admin1})</span>
                          )}
                          <span className="text-slate-400 ml-1.5">• {item.country}</span>
                        </div>
                      </div>
                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          <Check className="w-3 h-3" /> Sélectionnée
                        </span>
                      ) : (
                        <span className="text-indigo-600 font-semibold hover:underline">
                          Choisir
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                Aucune ville trouvée pour "{query}". Vérifiez l'orthographe.
              </div>
            )}
          </div>
        )}

        {/* Popular Shortcuts */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Villes suggérées
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {POPULAR_CITIES.map((city) => {
              const isSelected =
                city.name.toLowerCase() === profile.location.name.toLowerCase() &&
                city.country.toLowerCase() === profile.location.country.toLowerCase();
              return (
                <button
                  key={city.name}
                  type="button"
                  onClick={() => handleSelect(city)}
                  className={`px-3 py-2 text-xs rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "bg-indigo-50 border-indigo-500 text-indigo-900 font-bold ring-1 ring-indigo-500"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <span className="truncate">{city.name}</span>
                  {isSelected && <Check className="w-3 h-3 text-indigo-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="flex justify-end pt-3 border-t border-slate-100 mt-2 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
        >
          Fermer
        </button>
      </div>
      </div>
    </div>
  );
};
