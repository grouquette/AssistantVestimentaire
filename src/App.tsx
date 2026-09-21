import React, { useState, useEffect, useMemo } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  CloudSun,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import {
  FeedbackRecord,
  LifeContext,
  LocationInfo,
  UserProfile,
} from "./types";
import {
  getActiveProfileId,
  getStoredFeedbacks,
  getStoredProfiles,
  saveActiveProfileId,
  saveFeedback,
  saveProfiles,
} from "./services/storageService";
import { fetchTomorrowWeather } from "./services/weatherService";
import { generateOutfitRecommendation } from "./services/recommendationEngine";
import { Header } from "./components/Header";
import { ContextSelector } from "./components/ContextSelector";
import { WeatherDashboard } from "./components/WeatherDashboard";
import { RecommendationCard } from "./components/RecommendationCard";
import { AiStylistCard } from "./components/AiStylistCard";
import { ProfileModal } from "./components/ProfileModal";
import { LocationModal } from "./components/LocationModal";
import { FeedbackModal } from "./components/FeedbackModal";
import { CatalogModal } from "./components/CatalogModal";
import { FeedbackHistoryModal } from "./components/FeedbackHistoryModal";
import { WelcomeGuide } from "./components/WelcomeGuide";

export default function App() {
  // 1. Profils et profil actif
  const [profiles, setProfiles] = useState<UserProfile[]>(() => getStoredProfiles());
  const [activeProfileId, setActiveProfileId] = useState<string>(() => getActiveProfileId());

  // Guide de bienvenue pour les nouveaux utilisateurs (mémorisé dans localStorage)
  const [showWelcomeGuide, setShowWelcomeGuide] = useState<boolean>(() => {
    try {
      const dismissed = localStorage.getItem("meteo_welcome_dismissed");
      return dismissed !== "true";
    } catch {
      return true;
    }
  });

  const handleDismissWelcomeGuide = () => {
    setShowWelcomeGuide(false);
    try {
      localStorage.setItem("meteo_welcome_dismissed", "true");
    } catch {
      // ignore
    }
  };

  const handleToggleWelcomeGuide = () => {
    setShowWelcomeGuide((prev) => {
      const next = !prev;
      try {
        if (!next) {
          localStorage.setItem("meteo_welcome_dismissed", "true");
        }
      } catch {
        // ignore
      }
      return next;
    });
  };

  // 2. Modals state
  const [isNewProfileModalOpen, setIsNewProfileModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // 3. Retours d'expérience
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>(() => getStoredFeedbacks());

  // Profil actif résolu
  const activeProfile = useMemo(() => {
    return profiles.find((p) => p.id === activeProfileId) || profiles[0];
  }, [profiles, activeProfileId]);

  // Contexte actif résolu
  const activeContext = useMemo(() => {
    return (
      activeProfile.contexts.find((c) => c.id === activeProfile.activeContextId) ||
      activeProfile.contexts[0]
    );
  }, [activeProfile]);

  // 4. Météo de demain
  const [weatherState, setWeatherState] = useState<{
    loading: boolean;
    error: string | null;
    data: Awaited<ReturnType<typeof fetchTomorrowWeather>> | null;
  }>({
    loading: true,
    error: null,
    data: null,
  });

  // Recharger la météo dès que la localisation du profil actif change
  useEffect(() => {
    let isCancelled = false;

    async function loadWeather() {
      setWeatherState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const result = await fetchTomorrowWeather(activeProfile.location);
        if (!isCancelled) {
          setWeatherState({
            loading: false,
            error: null,
            data: result,
          });
        }
      } catch (err: any) {
        if (!isCancelled) {
          setWeatherState({
            loading: false,
            error: err.message || "Erreur lors du chargement des prévisions météo.",
            data: null,
          });
        }
      }
    }

    loadWeather();

    return () => {
      isCancelled = true;
    };
  }, [
    activeProfile.location.latitude,
    activeProfile.location.longitude,
    activeProfile.location.name,
  ]);

  // 5. Calcul de la recommandation par le moteur de règles (Trois Règles d'Or)
  const recommendation = useMemo(() => {
    if (!weatherState.data) return null;
    return generateOutfitRecommendation(
      activeProfile,
      activeContext,
      weatherState.data.dayMoments
    );
  }, [activeProfile, activeContext, weatherState.data]);

  // Gestionnaires de profils
  const handleSelectProfile = (id: string) => {
    setActiveProfileId(id);
    saveActiveProfileId(id);
  };

  const handleSaveProfile = (updatedProfile: UserProfile) => {
    const exists = profiles.some((p) => p.id === updatedProfile.id);
    let newProfiles: UserProfile[];
    if (exists) {
      newProfiles = profiles.map((p) => (p.id === updatedProfile.id ? updatedProfile : p));
    } else {
      newProfiles = [...profiles, updatedProfile];
      setActiveProfileId(updatedProfile.id);
      saveActiveProfileId(updatedProfile.id);
    }
    setProfiles(newProfiles);
    saveProfiles(newProfiles);
  };

  const handleSaveLocation = (newLocation: LocationInfo) => {
    const updated: UserProfile = {
      ...activeProfile,
      location: newLocation,
    };
    handleSaveProfile(updated);
  };

  const handleDeleteProfile = (id: string) => {
    if (profiles.length <= 1) return;
    const newProfiles = profiles.filter((p) => p.id !== id);
    setProfiles(newProfiles);
    saveProfiles(newProfiles);
    const nextActive = newProfiles[0].id;
    setActiveProfileId(nextActive);
    saveActiveProfileId(nextActive);
  };

  // Gestionnaires de contextes
  const handleSelectContext = (contextId: string) => {
    const updated = { ...activeProfile, activeContextId: contextId };
    handleSaveProfile(updated);
  };

  const handleAddContext = (newCtx: Omit<LifeContext, "id">) => {
    const id = "ctx-" + Date.now();
    const created: LifeContext = { ...newCtx, id };
    const updated: UserProfile = {
      ...activeProfile,
      contexts: [...activeProfile.contexts, created],
      activeContextId: id,
    };
    handleSaveProfile(updated);
  };

  const handleUpdateContext = (updatedCtx: LifeContext) => {
    const updated: UserProfile = {
      ...activeProfile,
      contexts: activeProfile.contexts.map((c) => (c.id === updatedCtx.id ? updatedCtx : c)),
    };
    handleSaveProfile(updated);
  };

  // Gestionnaire de feedback (Phase 4)
  const handleSaveFeedback = (record: FeedbackRecord, newSensitivity?: number) => {
    saveFeedback(record);
    setFeedbacks((prev) => [record, ...prev]);

    if (newSensitivity !== undefined && newSensitivity !== activeProfile.thermalSensitivity) {
      const updated = {
        ...activeProfile,
        thermalSensitivity: newSensitivity,
      };
      handleSaveProfile(updated);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-800 font-sans antialiased flex flex-col">
      {/* 1. Header with Family Profile Switcher and Live Date */}
      <Header
        profiles={profiles}
        activeProfile={activeProfile}
        onSelectProfile={handleSelectProfile}
        onOpenNewProfileModal={() => setIsNewProfileModalOpen(true)}
        onOpenEditProfileModal={() => setIsEditProfileModalOpen(true)}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenCatalogModal={() => setIsCatalogModalOpen(true)}
        onOpenFeedbackHistoryModal={() => setIsHistoryModalOpen(true)}
        onToggleWelcomeGuide={handleToggleWelcomeGuide}
        isWelcomeGuideVisible={showWelcomeGuide}
        tomorrowDateStr={weatherState.data?.dateStr || "Demain"}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Welcome Guide for New and Returning Users */}
        {showWelcomeGuide && (
          <WelcomeGuide
            onClose={handleDismissWelcomeGuide}
            onOpenNewProfileModal={() => setIsNewProfileModalOpen(true)}
            onOpenLocationModal={() => setIsLocationModalOpen(true)}
          />
        )}

        {/* Context Selector for Tomorrow */}
        <ContextSelector
          contexts={activeProfile.contexts}
          activeContextId={activeProfile.activeContextId}
          onSelectContext={handleSelectContext}
          onAddContext={handleAddContext}
          onUpdateContext={handleUpdateContext}
        />

        {/* Loading or Error banner */}
        {weatherState.loading && (
          <div className="bg-white rounded-3xl p-10 border border-amber-200/80 shadow-xs flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Analyse de la météo de demain pour toute la famille à {activeProfile.location.name}...
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              Calcul des écarts de température heure par heure pour le départ matinal à l'école ou au travail, et le confort tout au long de la journée.
            </p>
          </div>
        )}

        {weatherState.error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl p-4 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{weatherState.error}</span>
            </div>
            <button
              onClick={() => {
                setWeatherState((prev) => ({ ...prev, loading: true }));
                fetchTomorrowWeather(activeProfile.location).then((res) => {
                  setWeatherState({ loading: false, error: null, data: res });
                });
              }}
              className="px-3 py-1 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition-colors cursor-pointer"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Weather Dashboard (Phase 1) */}
        {!weatherState.loading && weatherState.data && (
          <WeatherDashboard
            weather={weatherState.data.dayMoments}
            hourly={weatherState.data.hourlyTomorrow}
            profile={activeProfile}
            dateStr={weatherState.data.dateStr}
            onOpenLocationModal={() => setIsLocationModalOpen(true)}
          />
        )}

        {/* Core Recommendation Card (Phase 2 & 3: 3 Inviolable Golden Rules) */}
        {!weatherState.loading && weatherState.data && recommendation && (
          <>
            <RecommendationCard
              recommendation={recommendation}
              profile={activeProfile}
              context={activeContext}
              onOpenFeedback={() => setIsFeedbackModalOpen(true)}
            />

            {/* Optional AI Stylist Card */}
            <div>
              <AiStylistCard
                profile={activeProfile}
                context={activeContext}
                weather={weatherState.data.dayMoments}
                recommendation={recommendation}
              />
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 border-t border-amber-200/60 py-5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="text-amber-600 font-bold">☀️ Assistant Météo Vestimentaire</span>
            <span>—</span>
            <span>Pour habiller sereinement petits et grands chaque matin selon la vraie météo.</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowWelcomeGuide(true)}
              className="hover:text-amber-900 font-semibold text-amber-800 cursor-pointer"
            >
              Guide &amp; Bienvenue
            </button>
            <span>•</span>
            <button
              onClick={() => setIsCatalogModalOpen(true)}
              className="hover:text-amber-900 font-medium cursor-pointer"
            >
              Dressing &amp; Vestiaire
            </button>
            <span>•</span>
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="hover:text-amber-900 font-medium cursor-pointer"
            >
              {feedbacks.length} avis enregistrés
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ProfileModal
        isOpen={isNewProfileModalOpen}
        onClose={() => setIsNewProfileModalOpen(false)}
        onSaveProfile={handleSaveProfile}
      />

      <ProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        profileToEdit={activeProfile}
        onSaveProfile={handleSaveProfile}
        onDeleteProfile={handleDeleteProfile}
        canDelete={profiles.length > 1}
      />

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        profile={activeProfile}
        onSaveLocation={handleSaveLocation}
      />

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        profile={activeProfile}
        context={activeContext}
        onSaveFeedback={handleSaveFeedback}
      />

      <CatalogModal
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
      />

      <FeedbackHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        feedbacks={feedbacks}
      />
    </div>
  );
}
