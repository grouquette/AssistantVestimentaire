import React, { useState } from "react";
import {
  Sparkles,
  X,
  Users,
  Sun,
  ShieldCheck,
  Compass,
  ArrowRight,
  Layers,
  ThermometerSnowflake,
  ClipboardList,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Plus,
  HelpCircle,
} from "lucide-react";

interface WelcomeGuideProps {
  onClose: () => void;
  onOpenNewProfileModal: () => void;
  onOpenLocationModal: () => void;
}

export const WelcomeGuide: React.FC<WelcomeGuideProps> = ({
  onClose,
  onOpenNewProfileModal,
  onOpenLocationModal,
}) => {
  const [isExpandedDetails, setIsExpandedDetails] = useState(false);

  return (
    <section
      id="welcome-guide-card"
      className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 border-2 border-amber-300/80 rounded-3xl p-5 sm:p-7 shadow-sm relative overflow-hidden transition-all"
      aria-labelledby="welcome-title"
    >
      {/* Decorative subtle background elements */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-orange-200/25 rounded-full blur-2xl pointer-events-none" />

      {/* Header banner */}
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md ring-2 ring-amber-300 shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-950 border border-amber-300">
                ✨ Guide de démarrage
              </span>
              <span className="text-xs font-semibold text-amber-900">
                Nouveau sur l'application ?
              </span>
            </div>
            <h2
              id="welcome-title"
              className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-heading mt-1"
            >
              Bienvenue sur l'Assistant Météo Vestimentaire ! ☀️
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1 max-w-3xl leading-relaxed">
              Fini le casse-tête matinal pour savoir comment s'habiller ou habiller les enfants.
              L'application analyse la météo de <strong>demain heure par heure</strong> pour vous
              recommander la tenue sur-mesure de chaque membre de la famille, dès la veille au soir.
            </p>
          </div>
        </div>

        {/* Close / Dismiss button */}
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-amber-100/70 rounded-full transition-colors cursor-pointer shrink-0"
          title="Fermer ce message de bienvenue"
          aria-label="Fermer le guide de bienvenue"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 3 Quick Start Steps (Par où commencer) */}
      <div className="mt-5 pt-5 border-t border-amber-200/80 relative z-10">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5 font-heading mb-3">
          <Compass className="w-4 h-4 text-amber-700" />
          Par où commencer ? 3 étapes simples :
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Step 1 */}
          <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-3.5 border border-amber-200/90 shadow-2xs hover:border-amber-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center shrink-0">
                  1
                </span>
                <h4 className="text-xs font-bold text-slate-900">
                  Choisissez qui habiller
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Cliquez sur un membre de la famille en haut (Enfant, Papa, Maman) ou ajoutez un proche avec le bouton <strong>+ Ajouter</strong>.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-amber-800 font-semibold">Crèche, école, adulte...</span>
              <button
                type="button"
                onClick={onOpenNewProfileModal}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 hover:text-amber-950 bg-amber-100/80 hover:bg-amber-200 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                Ajouter
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-3.5 border border-amber-200/90 shadow-2xs hover:border-amber-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center shrink-0">
                  2
                </span>
                <h4 className="text-xs font-bold text-slate-900">
                  Vérifiez ville &amp; activité
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Vérifiez la ville météo et sélectionnez l'activité prévue demain (école, bureau, parc, vélo...) pour adapter le dress code.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-orange-800 font-semibold">Météo heure par heure</span>
              <button
                type="button"
                onClick={onOpenLocationModal}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-900 hover:text-orange-950 bg-orange-100/80 hover:bg-orange-200 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
              >
                <MapPin className="w-3 h-3" />
                Ville
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-3.5 border border-amber-200/90 shadow-2xs hover:border-amber-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-black flex items-center justify-center shrink-0">
                  3
                </span>
                <h4 className="text-xs font-bold text-slate-900">
                  Consultez la tenue &amp; le résumé
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Découvrez les pièces pour le trajet extérieur et la journée intérieure, puis copiez le <strong>Résumé Rapide</strong> pour préparer les habits ce soir.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-rose-800 font-semibold">Gain de temps le matin</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                Prêt dès la veille
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion toggle to explore Core Features & Rules */}
      <div className="mt-4 pt-3 border-t border-amber-200/60 relative z-10">
        <button
          type="button"
          onClick={() => setIsExpandedDetails(!isExpandedDetails)}
          className="w-full flex items-center justify-between text-xs font-bold text-amber-950 hover:text-amber-800 p-2 rounded-xl hover:bg-amber-100/50 transition-colors cursor-pointer"
          aria-expanded={isExpandedDetails}
        >
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-700" />
            En savoir plus sur les fonctionnalités clés &amp; le principe de l'application
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800">
            {isExpandedDetails ? "Masquer les détails" : "Découvrir tout ce qu'elle fait"}
            {isExpandedDetails ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </span>
        </button>

        {isExpandedDetails && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 animate-in fade-in duration-200">
            {/* Feature 1 */}
            <div className="p-3.5 bg-white/95 rounded-2xl border border-amber-200/90 shadow-2xs space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                  <ThermometerSnowflake className="w-4 h-4" />
                </div>
                Dissociation Trajet Extérieur vs Journée Intérieure
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed pl-7">
                Les matins sont souvent frais (7-10°C) alors que les après-midis ou les bureaux montent à 21°C.
                L'algorithme vous évite de grelotter au départ sans étouffer à l'intérieur grâce à la technique des couches (manteau amovible, sous-pull ou t-shirt).
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-3.5 bg-white/95 rounded-2xl border border-amber-200/90 shadow-2xs space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <div className="p-1.5 rounded-lg bg-orange-100 text-orange-800">
                  <Users className="w-4 h-4" />
                </div>
                Calibrage Spécial Enfants, Bébés &amp; Adultes
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed pl-7">
                Les tout-petits bougent moins en poussette et nécessitent une couche en plus ; les écoliers courent en récréation et ont besoin d'habits faciles à enfiler. Chaque profil intègre ces règles spécifiques.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-3.5 bg-white/95 rounded-2xl border border-amber-200/90 shadow-2xs space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <div className="p-1.5 rounded-lg bg-rose-100 text-rose-800">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                Sensibilité Thermique &amp; Apprentissage Intelligent
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed pl-7">
                Vous êtes frileux ou plutôt chaleureux ? Indiquez-le sur votre profil. En laissant un avis rapide le soir ("J'ai eu un peu froid"), l'assistant ajuste automatiquement ses seuils thermiques !
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-3.5 bg-white/95 rounded-2xl border border-amber-200/90 shadow-2xs space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
                  <ClipboardList className="w-4 h-4" />
                </div>
                Dressing Virtuel &amp; Styliste IA
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed pl-7">
                Consultez le catalogue des vêtements d'extérieur et de journée, et profitez de suggestions d'accords de couleurs et de matières pour rester élégant sous la pluie ou le soleil.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons at bottom */}
      <div className="mt-4 pt-3 border-t border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 relative z-10">
        <span className="text-[11px] text-amber-900 font-medium text-center sm:text-left">
          💡 Vous pourrez réafficher ce guide à tout moment via le bouton <strong>Guide</strong> dans le menu ou en bas de page.
        </span>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-xs transition-all hover:scale-102 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>C'est parti, j'ai compris !</span>
          </button>
        </div>
      </div>
    </section>
  );
};
