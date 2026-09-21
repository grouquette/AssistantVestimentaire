import React, { useState } from "react";
import {
  Briefcase,
  Building,
  Check,
  Compass,
  Edit2,
  Flame,
  HardHat,
  Plus,
  Shield,
  ShieldAlert,
  Snowflake,
  Sparkles,
  Sun,
  Trees,
  X,
} from "lucide-react";
import {
  DestinationEnvironment,
  FormalityLevel,
  LifeContext,
  WorkEquipment,
} from "../types";

interface ContextSelectorProps {
  contexts: LifeContext[];
  activeContextId: string;
  onSelectContext: (id: string) => void;
  onAddContext: (context: Omit<LifeContext, "id">) => void;
  onUpdateContext: (context: LifeContext) => void;
}

export const ContextSelector: React.FC<ContextSelectorProps> = ({
  contexts,
  activeContextId,
  onSelectContext,
  onAddContext,
  onUpdateContext,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContext, setEditingContext] = useState<LifeContext | null>(null);

  // Modal form state
  const [name, setName] = useState("");
  const [formality, setFormality] = useState<FormalityLevel>(
    "Casual (T-shirt & Baskets)"
  );
  const [destinationEnvironment, setDestinationEnvironment] =
    useState<DestinationEnvironment>("Température Normale");
  const [workEquipment, setWorkEquipment] = useState<WorkEquipment>({
    safetyShoes: false,
    highVisibility: false,
    heavyDutyPants: false,
    workGloves: false,
  });

  const openNewModal = () => {
    setEditingContext(null);
    setName("");
    setFormality("Casual (T-shirt & Baskets)");
    setDestinationEnvironment("Température Normale");
    setWorkEquipment({
      safetyShoes: false,
      highVisibility: false,
      heavyDutyPants: false,
      workGloves: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (ctx: LifeContext, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingContext(ctx);
    setName(ctx.name);
    setFormality(ctx.formality);
    setDestinationEnvironment(ctx.destinationEnvironment);
    setWorkEquipment(
      ctx.workEquipment || {
        safetyShoes: false,
        highVisibility: false,
        heavyDutyPants: false,
        workGloves: false,
      }
    );
    setIsModalOpen(true);
  };

  const applyPreset = (
    presetName: string,
    presetFormality: FormalityLevel,
    presetEnv: DestinationEnvironment,
    presetEquip: WorkEquipment
  ) => {
    setName(presetName);
    setFormality(presetFormality);
    setDestinationEnvironment(presetEnv);
    setWorkEquipment(presetEquip);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingContext) {
      onUpdateContext({
        ...editingContext,
        name: name.trim(),
        formality,
        destinationEnvironment,
        workEquipment,
      });
    } else {
      onAddContext({
        name: name.trim(),
        formality,
        destinationEnvironment,
        workEquipment,
      });
    }
    setIsModalOpen(false);
  };

  const getFormalityBadge = (f: FormalityLevel) => {
    switch (f) {
      case "Casual (T-shirt & Baskets)":
        return {
          label: "Casual (T-shirt & Baskets)",
          color: "bg-teal-50 text-teal-800 border-teal-200",
        };
      case "Professionnel / Chantier & EPI":
        return {
          label: "Chantier & EPI (Sécurité)",
          color: "bg-amber-50 text-amber-800 border-amber-300 font-semibold",
        };
      case "Formel/Strict":
        return {
          label: "Formel / Strict",
          color: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case "Business Casual":
        return {
          label: "Business Casual",
          color: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "Décontracté":
        return {
          label: "Décontracté",
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "Sport":
        return {
          label: "Sport / Dynamique",
          color: "bg-rose-50 text-rose-700 border-rose-200",
        };
    }
  };

  const getEnvBadge = (env: DestinationEnvironment) => {
    switch (env) {
      case "Chauffé/Surchauffé":
        return {
          label: "Chauffé / Surchauffé",
          icon: <Flame className="w-3 h-3 text-orange-500" />,
          color: "bg-orange-50 text-orange-700 border-orange-200",
        };
      case "Température Normale":
        return {
          label: "Température Normale (~20°C)",
          icon: <Building className="w-3 h-3 text-slate-500" />,
          color: "bg-slate-50 text-slate-700 border-slate-200",
        };
      case "Climatisé/Frais":
        return {
          label: "Climatisé / Frais",
          icon: <Snowflake className="w-3 h-3 text-cyan-500" />,
          color: "bg-cyan-50 text-cyan-700 border-cyan-200",
        };
      case "Principalement en Extérieur":
        return {
          label: "Extérieur dominant",
          icon: <Trees className="w-3 h-3 text-emerald-500" />,
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
    }
  };

  return (
    <section className="bg-white rounded-3xl p-6 border border-amber-200/80 shadow-xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 font-heading">
            <Briefcase className="w-4 h-4 text-amber-600" />
            Programme &amp; Activités de Demain
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            École, crèche, bureau casual (T-shirt/baskets), chantier ou sortie parc : adapte la tenue au programme de la journée.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3.5 py-2 rounded-xl border border-amber-300 transition-all cursor-pointer self-start sm:self-auto shadow-2xs hover:scale-102"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ajouter une activité</span>
        </button>
      </div>

      {/* Grid of Context cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {contexts.map((ctx) => {
          const isSelected = ctx.id === activeContextId;
          const formalityBadge = getFormalityBadge(ctx.formality);
          const envBadge = getEnvBadge(ctx.destinationEnvironment);
          const hasSafetyGear =
            ctx.workEquipment?.safetyShoes ||
            ctx.workEquipment?.highVisibility ||
            ctx.formality === "Professionnel / Chantier & EPI";

          return (
            <div
              key={ctx.id}
              onClick={() => onSelectContext(ctx.id)}
              className={`group relative p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                isSelected
                  ? "bg-amber-50/80 border-amber-400 shadow-xs ring-2 ring-amber-300 scale-101"
                  : "bg-amber-50/20 border-amber-200/70 hover:border-amber-300 hover:bg-amber-50/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <span className="text-sm font-bold text-slate-900 line-clamp-1 font-heading">
                  {ctx.name}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => openEditModal(ctx, e)}
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-slate-500 hover:text-amber-800 p-1.5 sm:p-1 rounded-lg hover:bg-amber-100/70 transition-all cursor-pointer touch-manipulation"
                    title="Modifier cette activité"
                    aria-label="Modifier l'activité"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-center text-xs shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
              </div>

              {/* 2 mandatory parameters tags */}
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Dress code :
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${formalityBadge.color}`}
                  >
                    {formalityBadge.label}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Lieu :
                  </span>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-lg border flex items-center gap-1 ${envBadge.color}`}
                  >
                    {envBadge.icon}
                    <span className="truncate max-w-[120px]">{envBadge.label}</span>
                  </span>
                </div>

                {hasSafetyGear && (
                  <div className="pt-1.5 mt-1 border-t border-amber-200/60 flex items-center gap-1 flex-wrap">
                    {ctx.workEquipment?.safetyShoes && (
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded-md border border-amber-300 flex items-center gap-1">
                        🥾 Sécurité
                      </span>
                    )}
                    {ctx.workEquipment?.highVisibility && (
                      <span className="text-[10px] bg-yellow-100 text-yellow-950 font-bold px-1.5 py-0.5 rounded-md border border-yellow-300">
                        🦺 Fluo
                      </span>
                    )}
                    {ctx.workEquipment?.heavyDutyPants && (
                      <span className="text-[10px] bg-slate-200 text-slate-800 font-semibold px-1.5 py-0.5 rounded-md">
                        👖 Pantalon Pro
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Context creation / edit modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-amber-200 my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3.5 border-b border-amber-100 mb-4 shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  {editingContext ? "Modifier l'activité" : "Ajouter une activité pour demain"}
                </h3>
                <p className="text-xs text-slate-500">
                  Définissez l'environnement et les contraintes vestimentaires (école, casual, EPI...).
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto pr-1">
                {/* Quick Presets */}
            {!editingContext && (
              <div className="mb-4 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80">
                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block mb-2 font-heading">
                  ✨ Modèles rapides famille &amp; travail :
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      applyPreset(
                        "Journée d'école & récréation",
                        "Décontracté",
                        "Température Normale",
                        { safetyShoes: false }
                      )
                    }
                    className="text-xs px-2.5 py-1 rounded-xl bg-white border border-amber-200 hover:border-amber-400 hover:text-amber-900 font-semibold cursor-pointer shadow-2xs"
                  >
                    🎒 École &amp; Récréation
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyPreset(
                        "Journée crèche & nounou",
                        "Décontracté",
                        "Température Normale",
                        { safetyShoes: false }
                      )
                    }
                    className="text-xs px-2.5 py-1 rounded-xl bg-white border border-purple-200 hover:border-purple-400 hover:text-purple-900 font-semibold cursor-pointer shadow-2xs"
                  >
                    👶 Crèche &amp; Bébé
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyPreset(
                        "Bureau Casual (T-shirt & Baskets)",
                        "Casual (T-shirt & Baskets)",
                        "Température Normale",
                        { safetyShoes: false, highVisibility: false }
                      )
                    }
                    className="text-xs px-2.5 py-1 rounded-xl bg-white border border-amber-200 hover:border-amber-400 hover:text-amber-900 font-semibold cursor-pointer shadow-2xs"
                  >
                    👟 Bureau Casual (T-shirt &amp; Baskets)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyPreset(
                        "Chantier & Ateliers (EPI)",
                        "Professionnel / Chantier & EPI",
                        "Principalement en Extérieur",
                        {
                          safetyShoes: true,
                          highVisibility: true,
                          heavyDutyPants: true,
                          workGloves: true,
                        }
                      )
                    }
                    className="text-xs px-2.5 py-1 rounded-xl bg-white border border-amber-300 hover:border-amber-500 hover:text-amber-950 font-semibold cursor-pointer shadow-2xs"
                  >
                    🥾 Chantier &amp; Sécurité (EPI)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyPreset(
                        "Sortie Parc & Jeux Extérieur",
                        "Décontracté",
                        "Principalement en Extérieur",
                        {}
                      )
                    }
                    className="text-xs px-2.5 py-1 rounded-xl bg-white border border-emerald-200 hover:border-emerald-400 hover:text-emerald-900 font-semibold cursor-pointer shadow-2xs"
                  >
                    🌳 Sortie Parc en Famille
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyPreset(
                        "Bureau formel & Réunions",
                        "Formel/Strict",
                        "Chauffé/Surchauffé",
                        {}
                      )
                    }
                    className="text-xs px-2.5 py-1 rounded-xl bg-white border border-slate-200 hover:border-slate-400 hover:text-slate-900 font-semibold cursor-pointer shadow-2xs"
                  >
                    👔 Bureau formel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nom du contexte
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Bureau Casual, Chantier extérieur, Journée d'école..."
                  required
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Paramètre 1 : Niveau de Formalité & Style */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  1. Style & Niveau de Formalité
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      {
                        val: "Casual (T-shirt & Baskets)",
                        desc: "T-shirt soigné, baskets & confort moderne",
                      },
                      {
                        val: "Professionnel / Chantier & EPI",
                        desc: "Chaussures de sécurité, vêtements de travail, EPI",
                      },
                      {
                        val: "Business Casual",
                        desc: "Polo, chemise décontractée, chino",
                      },
                      {
                        val: "Formel/Strict",
                        desc: "Costume, tailleur, derbies habillées",
                      },
                      {
                        val: "Décontracté",
                        desc: "Week-end, maison, tenue relax",
                      },
                      {
                        val: "Sport",
                        desc: "Running, jogging, vêtements techniques",
                      },
                    ] as { val: FormalityLevel; desc: string }[]
                  ).map((f) => (
                    <button
                      key={f.val}
                      type="button"
                      onClick={() => {
                        setFormality(f.val);
                        if (f.val === "Professionnel / Chantier & EPI") {
                          setWorkEquipment((prev) => ({
                            ...prev,
                            safetyShoes: true,
                            highVisibility: true,
                          }));
                        }
                      }}
                      className={`text-xs p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        formality === f.val
                          ? "border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600 font-semibold"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="font-semibold">{f.val}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{f.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Paramètre 2 : Équipements Professionnels et EPI */}
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200">
                <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <HardHat className="w-3.5 h-3.5 text-amber-700" />
                  Équipements professionnels & de sécurité (EPI)
                </label>
                <p className="text-[11px] text-amber-800/80 mb-2.5">
                  Recommandations thermiques spécifiques (gestion du pont thermique de la coque de sécurité par temps froid).
                </p>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(workEquipment.safetyShoes)}
                      onChange={(e) =>
                        setWorkEquipment((prev) => ({
                          ...prev,
                          safetyShoes: e.target.checked,
                        }))
                      }
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>🥾 Chaussures de sécurité coquées obligatoires (norme S1P / S3)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(workEquipment.highVisibility)}
                      onChange={(e) =>
                        setWorkEquipment((prev) => ({
                          ...prev,
                          highVisibility: e.target.checked,
                        }))
                      }
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>🦺 Haute visibilité requise (Gilet fluo classe 2 ou Parka fluo)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(workEquipment.heavyDutyPants)}
                      onChange={(e) =>
                        setWorkEquipment((prev) => ({
                          ...prev,
                          heavyDutyPants: e.target.checked,
                        }))
                      }
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>👖 Pantalon de travail renforcé multipoches</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(workEquipment.workGloves)}
                      onChange={(e) =>
                        setWorkEquipment((prev) => ({
                          ...prev,
                          workGloves: e.target.checked,
                        }))
                      }
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>🧤 Gants de protection & manutention</span>
                  </label>
                </div>
              </div>

              {/* Paramètre 3 : Environnement à Destination */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  2. Environnement Principal à Destination
                </label>
                <div className="space-y-1.5">
                  {(
                    [
                      {
                        val: "Chauffé/Surchauffé",
                        desc: "Pièces très chauffées (>22°C) - Vêtements intérieurs légers",
                      },
                      {
                        val: "Température Normale",
                        desc: "Température classique (~20°C) - Tenue équilibrée",
                      },
                      {
                        val: "Climatisé/Frais",
                        desc: "Air frais ou climatisé (~18°C) - Surchemise ou cardigan amovible",
                      },
                      {
                        val: "Principalement en Extérieur",
                        desc: "Chantier, cour ou plein air - Tenue de base chaude et coupe-vent",
                      },
                    ] as { val: DestinationEnvironment; desc: string }[]
                  ).map((env) => (
                    <div
                      key={env.val}
                      onClick={() => setDestinationEnvironment(env.val)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        destinationEnvironment === env.val
                          ? "border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold ring-1 ring-indigo-600"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="font-semibold">{env.val}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{env.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
            >
              Enregistrer ce contexte
            </button>
          </div>
        </form>
      </div>
    </div>
  )}
</section>
);
};
