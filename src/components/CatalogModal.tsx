import React, { useState } from "react";
import {
  X,
  BookOpen,
  Filter,
  Layers,
  Shirt,
  Shield,
  CloudRain,
  Wind,
  Footprints,
  Sparkles,
} from "lucide-react";
import { CLOTHING_CATALOG } from "../data/clothingCatalog";
import { ClothingSection, FormalityLevel } from "../types";

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CatalogModal: React.FC<CatalogModalProps> = ({ isOpen, onClose }) => {
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [selectedFormality, setSelectedFormality] = useState<string>("all");

  if (!isOpen) return null;

  const filteredItems = CLOTHING_CATALOG.filter((item) => {
    if (selectedSection !== "all" && item.section !== selectedSection) return false;
    if (
      selectedFormality !== "all" &&
      !item.allowedFormalities.includes(selectedFormality as FormalityLevel)
    ) {
      return false;
    }
    return true;
  });

  const getSectionTitle = (s: ClothingSection) => {
    switch (s) {
      case "couche_protection":
        return "Couche de Protection (Trajet)";
      case "tenue_base":
        return "Tenue de Base (Destination)";
      case "accessoire_alerte":
        return "Accessoires & Alertes";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-4 sm:p-6 shadow-xl border border-slate-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Base de Données Vestimentaire Interne
              </h3>
              <p className="text-xs text-slate-500">
                Chaque vêtement est étiqueté avec ses propriétés thermiques, imperméables et formelles.
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

        {/* Filters */}
        <div className="py-3 border-b border-slate-100 flex flex-wrap gap-2 items-center shrink-0 text-xs">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
            Filtre section :
          </span>
          {[
            { val: "all", label: "Tous" },
            { val: "couche_protection", label: "Couches protection" },
            { val: "tenue_base", label: "Tenue de base" },
            { val: "accessoire_alerte", label: "Accessoires" },
          ].map((f) => (
            <button
              key={f.val}
              onClick={() => setSelectedSection(f.val)}
              className={`px-2.5 py-1 rounded-md border font-medium cursor-pointer transition-colors ${
                selectedSection === f.val
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {f.label}
            </button>
          ))}

          <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] ml-2">
            Formalité :
          </span>
          {["all", "Formel/Strict", "Business Casual", "Décontracté", "Sport"].map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFormality(f)}
              className={`px-2.5 py-1 rounded-md border font-medium cursor-pointer transition-colors ${
                selectedFormality === f
                  ? "bg-slate-900 border-slate-900 text-white"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {f === "all" ? "Toutes" : f}
            </button>
          ))}
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-colors flex items-start justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {getSectionTitle(item.section)}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500">
                    {item.subCategory}
                  </span>
                </div>
                <p className="text-slate-600 mt-1">{item.description}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap text-[10px]">
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Chaleur {item.warmthLevel}/5
                  </span>
                  {item.waterproofLevel > 0 && (
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                      <CloudRain className="w-2.5 h-2.5" />
                      Imperméable {item.waterproofLevel}/3
                    </span>
                  )}
                  {item.windproof && (
                    <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 flex items-center gap-1">
                      <Wind className="w-2.5 h-2.5" /> Coupe-vent
                    </span>
                  )}
                  <span className="text-slate-400">
                    Formalités : {item.allowedFormalities.join(", ")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
