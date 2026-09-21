import React, { useState, useEffect } from "react";
import {
  X,
  ThumbsUp,
  ThumbsDown,
  Snowflake,
  Flame,
  CheckCircle2,
  Sparkles,
  Sliders,
} from "lucide-react";
import { FeedbackRecord, LifeContext, UserProfile } from "../types";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  context: LifeContext;
  onSaveFeedback: (record: FeedbackRecord, newSensitivity?: number) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  profile,
  context,
  onSaveFeedback,
}) => {
  const [rating, setRating] = useState<"positive" | "negative">("positive");
  const [tag, setTag] = useState<
    "trop_chaud" | "trop_froid" | "trop_decontracte" | "trop_habille" | "parfait"
  >("parfait");
  const [comment, setComment] = useState("");
  const [adjustSensitivity, setAdjustSensitivity] = useState(true);

  // Effacer le contenu du champ remarque ou détail dès l'ouverture d'un nouvel avis
  useEffect(() => {
    if (isOpen) {
      setComment("");
      setRating("positive");
      setTag("parfait");
    }
  }, [isOpen, profile.id, context.id]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let newSensitivity: number | undefined = undefined;
    if (adjustSensitivity) {
      if (tag === "trop_froid") {
        newSensitivity = Math.min(3, profile.thermalSensitivity + 1);
      } else if (tag === "trop_chaud") {
        newSensitivity = Math.max(-3, profile.thermalSensitivity - 1);
      }
    }

    const record: FeedbackRecord = {
      id: "fb-" + Date.now(),
      profileId: profile.id,
      date: new Date().toISOString(),
      contextName: context.name,
      rating,
      tag,
      comment: comment.trim() || undefined,
      sensitivityAdjusted: newSensitivity !== undefined && newSensitivity !== profile.thermalSensitivity,
    };

    onSaveFeedback(record, newSensitivity);
    // Effacer le champ commentaire pour l'avis suivant
    setComment("");
    setRating("positive");
    setTag("parfait");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-amber-200/80">
        <div className="flex items-center justify-between pb-3.5 border-b border-amber-100 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-1.5">
              <span>🌟</span>
              <span>Retour d'expérience pour {profile.name}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Aidez l'assistant météo à affiner la garde-robe familiale.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Note globale */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Ce conseil était-il bon ?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRating("positive");
                  setTag("parfait");
                }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border font-semibold text-xs transition-all cursor-pointer ${
                  rating === "positive"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <ThumbsUp className="w-4 h-4 text-emerald-600" />
                <span>Oui, très pertinent !</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRating("negative");
                  if (tag === "parfait") setTag("trop_froid");
                }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border font-semibold text-xs transition-all cursor-pointer ${
                  rating === "negative"
                    ? "border-rose-600 bg-rose-50 text-rose-900 ring-1 ring-rose-600"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <ThumbsDown className="w-4 h-4 text-rose-600" />
                <span>À améliorer</span>
              </button>
            </div>
          </div>

          {/* Tag de ressenti */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Ressenti précis
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setTag("parfait");
                  setRating("positive");
                }}
                className={`p-2 rounded-lg border text-left font-medium cursor-pointer transition-all ${
                  tag === "parfait"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-bold"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Confort parfait</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTag("trop_froid");
                  setRating("negative");
                }}
                className={`p-2 rounded-lg border text-left font-medium cursor-pointer transition-all ${
                  tag === "trop_froid"
                    ? "border-sky-600 bg-sky-50 text-sky-900 font-bold"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Snowflake className="w-3.5 h-3.5 text-sky-600" />
                  <span>J'ai eu trop froid</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTag("trop_chaud");
                  setRating("negative");
                }}
                className={`p-2 rounded-lg border text-left font-medium cursor-pointer transition-all ${
                  tag === "trop_chaud"
                    ? "border-orange-600 bg-orange-50 text-orange-900 font-bold"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-600" />
                  <span>J'ai eu trop chaud</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTag("trop_decontracte");
                  setRating("negative");
                }}
                className={`p-2 rounded-lg border text-left font-medium cursor-pointer transition-all ${
                  tag === "trop_decontracte"
                    ? "border-purple-600 bg-purple-50 text-purple-900 font-bold"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>Trop décontracté</span>
              </button>
            </div>
          </div>

          {/* Auto calibration proposal if trop froid / trop chaud */}
          {(tag === "trop_froid" || tag === "trop_chaud") && (
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 flex items-start gap-2.5">
              <Sliders className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-indigo-900 block">
                  Ajustement automatique du profil suggéré
                </span>
                <p className="text-indigo-800/80 mt-0.5">
                  {tag === "trop_froid"
                    ? `Passer la sensibilité de ${profile.name} de ${profile.thermalSensitivity} à ${Math.min(
                        3,
                        profile.thermalSensitivity + 1
                      )} (pour recommander des couches plus chaudes).`
                    : `Passer la sensibilité de ${profile.name} de ${profile.thermalSensitivity} à ${Math.max(
                        -3,
                        profile.thermalSensitivity - 1
                      )} (pour des tenues plus respirantes).`}
                </p>
                <label className="flex items-center gap-2 mt-2 cursor-pointer font-semibold text-indigo-950">
                  <input
                    type="checkbox"
                    checked={adjustSensitivity}
                    onChange={(e) => setAdjustSensitivity(e.target.checked)}
                    className="accent-indigo-600"
                  />
                  <span>Appliquer cet ajustement à mon profil</span>
                </label>
              </div>
            </div>
          )}

          {/* Commentaire optionnel */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Remarque ou détail (Optionnel)
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ex: Le vent était très frais vers 18h..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
            >
              Fermer
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-xs cursor-pointer transition-all hover:scale-102"
            >
              Enregistrer mon retour
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
