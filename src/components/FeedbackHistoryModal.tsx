import React from "react";
import { X, History, ThumbsUp, ThumbsDown, Sliders } from "lucide-react";
import { FeedbackRecord } from "../types";

interface FeedbackHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedbacks: FeedbackRecord[];
}

export const FeedbackHistoryModal: React.FC<FeedbackHistoryModalProps> = ({
  isOpen,
  onClose,
  feedbacks,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-xl border border-slate-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Historique des Retours d'Expérience
              </h3>
              <p className="text-xs text-slate-500">
                Données collectées pour l'apprentissage continu et l'auto-calibrage.
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

        <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
          {feedbacks.length > 0 ? (
            feedbacks.map((fb) => (
              <div
                key={fb.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs flex items-start gap-3"
              >
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    fb.rating === "positive"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {fb.rating === "positive" ? (
                    <ThumbsUp className="w-4 h-4" />
                  ) : (
                    <ThumbsDown className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      Contexte : {fb.contextName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(fb.date).toLocaleDateString("fr-FR")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                      {fb.tag || "Retour"}
                    </span>
                    {fb.sensitivityAdjusted && (
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 flex items-center gap-1">
                        <Sliders className="w-2.5 h-2.5" /> Profil calibré
                      </span>
                    )}
                  </div>

                  {fb.comment && (
                    <p className="text-slate-600 mt-1 italic">« {fb.comment} »</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              Aucun retour enregistré pour le moment. Donnez votre avis après chaque recommandation !
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
