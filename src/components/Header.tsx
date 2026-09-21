import React, { useState } from "react";
import {
  MapPin,
  Plus,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  BookOpen,
  History,
  Thermometer,
  UserCog,
  Sun,
  Heart,
  HelpCircle,
  Users,
  X,
} from "lucide-react";
import { UserProfile } from "../types";
import { getThermalSensitivityLabel } from "../services/storageService";

interface HeaderProps {
  profiles: UserProfile[];
  activeProfile: UserProfile;
  onSelectProfile: (id: string) => void;
  onOpenNewProfileModal: () => void;
  onOpenEditProfileModal: () => void;
  onOpenLocationModal: () => void;
  onOpenCatalogModal: () => void;
  onOpenFeedbackHistoryModal: () => void;
  onToggleWelcomeGuide?: () => void;
  isWelcomeGuideVisible?: boolean;
  tomorrowDateStr: string;
}

export const Header: React.FC<HeaderProps> = ({
  profiles,
  activeProfile,
  onSelectProfile,
  onOpenNewProfileModal,
  onOpenEditProfileModal,
  onOpenLocationModal,
  onOpenCatalogModal,
  onOpenFeedbackHistoryModal,
  onToggleWelcomeGuide,
  isWelcomeGuideVisible = false,
  tomorrowDateStr,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const thermalInfo = getThermalSensitivityLabel(activeProfile.thermalSensitivity);

  // Helper to determine friendly family emoji
  const getFamilyEmoji = (p: UserProfile): string => {
    if (p.type === "Enfant") {
      if ((p.childAge ?? 3) <= 2) return "👶";
      if ((p.childAge ?? 3) <= 5) return "🧒";
      return p.gender === "Femme" ? "👧" : "👦";
    }
    if (p.name.toLowerCase().includes("maman") || (p.gender === "Femme" && p.type === "Adulte")) {
      return "👩";
    }
    if (p.name.toLowerCase().includes("papa") || (p.gender === "Homme" && p.type === "Adulte")) {
      return "👨";
    }
    return "👤";
  };

  const activeEmoji = getFamilyEmoji(activeProfile);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-amber-200/70 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar with title, mobile menu trigger and desktop utilities */}
        <div className="flex items-center justify-between py-3 sm:py-3.5 border-b border-amber-100/80 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            {/* Friendly family logo icon */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-rose-400 flex items-center justify-center text-white shadow-sm ring-2 ring-amber-200/60 shrink-0">
              <Sun className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-heading truncate">
                  Assistant Météo Vestimentaire
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                  👨‍👩‍👧‍👦 Spécial Famille
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 font-medium truncate mt-0.5">
                La météo &amp; les tenues de demain pour petits et grands •{" "}
                <span className="text-amber-900 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  {tomorrowDateStr}
                </span>
              </p>
            </div>
          </div>

          {/* Desktop quick links */}
          <div className="hidden md:flex items-center gap-2 flex-wrap">
            <button
              onClick={onOpenLocationModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-amber-50/50 hover:bg-amber-100/70 border border-amber-200 rounded-xl transition-all cursor-pointer shadow-2xs"
              title="Modifier uniquement la ville météo de ce profil"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span className="font-bold text-slate-900">{activeProfile.location.name}</span>
              <span className="text-slate-400">({activeProfile.location.country})</span>
              <span className="text-[10px] text-amber-800 font-bold bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded-md ml-0.5">
                Changer
              </span>
            </button>

            <button
              onClick={onOpenEditProfileModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-amber-50/60 border border-slate-300 rounded-xl transition-all cursor-pointer shadow-2xs"
              title="Modifier l'identité, l'âge de l'enfant ou la sensibilité au froid"
            >
              <UserCog className="w-3.5 h-3.5 text-amber-600" />
              <span>Gérer le profil</span>
            </button>

            <button
              onClick={onOpenCatalogModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
              title="Consulter le dressing de vêtements et accessoires"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Dressing</span>
            </button>

            <button
              onClick={onOpenFeedbackHistoryModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
              title="Historique des retours d'expérience et confort"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>Avis</span>
            </button>

            {onToggleWelcomeGuide && (
              <button
                onClick={onToggleWelcomeGuide}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs border ${
                  isWelcomeGuideVisible
                    ? "bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300"
                    : "bg-amber-100 hover:bg-amber-200/90 text-amber-950 border-amber-300"
                }`}
                title="Consulter le guide de bienvenue et explications"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Guide</span>
              </button>
            )}
          </div>

          {/* Mobile trigger button for management menu */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold border border-amber-300 cursor-pointer shadow-2xs"
              title="Ouvrir le menu de gestion"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-800" />
              <span>Gestion</span>
            </button>
          </div>
        </div>

        {/* Family members switcher row - optimized for touch & mobile */}
        <div className="py-2 sm:py-2.5 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex items-center gap-2 flex-nowrap shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900/80 mr-0.5 flex items-center gap-1 shrink-0 font-heading">
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">La Famille :</span>
            </span>

            {profiles.map((p) => {
              const isActive = p.id === activeProfile.id;
              const emoji = getFamilyEmoji(p);
              const compactTag =
                p.type === "Enfant"
                  ? `${p.childAge ?? 3} ans`
                  : p.gender === "Femme"
                  ? "Maman"
                  : "Papa";

              return (
                <button
                  key={p.id}
                  onClick={() => onSelectProfile(p.id)}
                  className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl text-xs transition-all whitespace-nowrap cursor-pointer touch-manipulation min-h-[38px] ${
                    isActive
                      ? "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-bold shadow-xs ring-2 ring-amber-300 ring-offset-1 scale-102"
                      : "bg-amber-50/80 text-slate-700 hover:bg-amber-100 border border-amber-200/80 font-medium"
                  }`}
                >
                  <span className="text-sm">{emoji}</span>
                  <span className="font-semibold">{p.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? "bg-white/25 text-white border border-white/30"
                        : "bg-white/80 text-amber-900 border border-amber-200"
                    }`}
                  >
                    {compactTag}
                  </span>
                </button>
              );
            })}

            <button
              onClick={onOpenNewProfileModal}
              className="inline-flex items-center gap-1 px-3 py-1.5 sm:py-2 rounded-2xl text-xs font-bold text-amber-950 bg-amber-100/90 hover:bg-amber-200 border border-amber-300 transition-all whitespace-nowrap cursor-pointer shadow-2xs hover:scale-102 min-h-[38px]"
              title="Ajouter un enfant, un parent ou un proche"
            >
              <Plus className="w-3.5 h-3.5 text-amber-800" />
              <span>+ Ajouter</span>
            </button>
          </div>

          {/* Active Profile mini status summary */}
          <div className="hidden lg:flex items-center gap-3 text-xs text-slate-600 pl-4 border-l border-amber-200/70 shrink-0">
            <button
              onClick={onOpenEditProfileModal}
              className="hover:text-slate-900 flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium bg-amber-50/60 px-2.5 py-1 rounded-xl border border-amber-200/60 transition-colors"
              title="Ajuster la sensibilité au froid de ce profil"
            >
              <Thermometer className="w-3.5 h-3.5 text-rose-500" />
              <span>Sensibilité :</span>
              <span className="text-[11px] font-bold px-1.5 py-0.2 rounded bg-white text-amber-900 border border-amber-200">
                {thermalInfo.badge}
              </span>
              <Sliders className="w-3 h-3 text-amber-700 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE MANAGEMENT MENU MODAL / DRAWER */}
      {/* ========================================================================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-amber-200 animate-in fade-in slide-in-from-bottom duration-200">
            {/* Header of mobile menu */}
            <div className="flex items-center justify-between pb-3.5 border-b border-amber-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    Menu de Gestion
                  </h3>
                  <p className="text-xs text-slate-500">
                    Profil actif : <strong className="text-slate-800">{activeEmoji} {activeProfile.name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick profile switch inside the menu */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Changer de membre de la famille
              </label>
              <div className="grid grid-cols-2 gap-2">
                {profiles.map((p) => {
                  const isSel = p.id === activeProfile.id;
                  const emo = getFamilyEmoji(p);
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectProfile(p.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                        isSel
                          ? "bg-amber-100/80 border-amber-400 text-amber-950 font-bold ring-2 ring-amber-300"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-amber-50/50"
                      }`}
                    >
                      <span className="text-base">{emo}</span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate">{p.name}</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          {p.type === "Enfant" ? `${p.childAge} ans` : "Adulte"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action buttons list */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenEditProfileModal();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white text-amber-700 flex items-center justify-center border border-amber-200 shadow-2xs">
                    <UserCog className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Gérer le profil de {activeProfile.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Sensibilité {thermalInfo.badge} • Dress code &amp; âge
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-800 bg-white px-2 py-1 rounded-lg border border-amber-200">
                  Modifier
                </span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenLocationModal();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-amber-50/50 border border-slate-200 text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white text-rose-600 flex items-center justify-center border border-slate-200 shadow-2xs">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Ville météo : {activeProfile.location.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {activeProfile.location.admin1 || activeProfile.location.country}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-700 bg-white px-2 py-1 rounded-lg border border-slate-200">
                  Changer
                </span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenCatalogModal();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-amber-50/50 border border-slate-200 text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white text-blue-600 flex items-center justify-center border border-slate-200 shadow-2xs">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Dressing vestiaire
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Explorer tous les vêtements et chaussures
                    </div>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200">
                  Voir
                </span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenFeedbackHistoryModal();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-amber-50/50 border border-slate-200 text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white text-emerald-600 flex items-center justify-center border border-slate-200 shadow-2xs">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Historique des avis
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Consulter les retours confort et calibrage
                    </div>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200">
                  Avis
                </span>
              </button>

              {onToggleWelcomeGuide && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onToggleWelcomeGuide();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-50 hover:bg-amber-100/90 border border-amber-200 text-left cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white text-amber-700 flex items-center justify-center border border-amber-200 shadow-2xs">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Guide de bienvenue &amp; Découverte
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Comprendre le fonctionnement et astuces météo
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-800 bg-white px-2 py-1 rounded-lg border border-amber-200">
                    Aide
                  </span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenNewProfileModal();
                }}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Ajouter un membre à la famille</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

