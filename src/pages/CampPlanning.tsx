import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import CreateActivityModal from "../features/planning/CreateActivityModal";
import { useParams } from "react-router-dom";
import CampLayout from "../layouts/CampLayout";
import { supabase } from "../lib/supabaseClient";
import { getCampDetails, getCampActivities } from "../services/campServices";
import type {
  Camp,
  Activity,
  DragState,
} from "../features/planning/planningTypes";
import {
  getDaysBetween,
  colorForRelation,
  computeActivityPlacement,
  buildPlanningConfig,
  type PlanningConfig,
} from "../features/planning/planningUtils";

export default function CampPlanning() {
  const { id } = useParams<{ id: string }>();
  const campId = Number(id);

  const [camp, setCamp] = useState<Camp | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [planningConfig, setPlanningConfig] =
    useState<PlanningConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createInfo, setCreateInfo] = useState<{
    date: string;
    startTime: string;
    endTime: string;
  } | null>(null);

  // Drag vertical
  const [drag, setDrag] = useState<DragState | null>(null);

useEffect(() => {
    if (!campId) return;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
            // --- CORRECTION: UTILISER LES SERVICES RPC ---
            const [campData, actData] = await Promise.all([
              getCampDetails(campId), 
              getCampActivities(campId),
            ]);
            // ---------------------------------------------

            if (!campData) throw new Error("Camp introuvable ou accès refusé.");
            if (!actData) throw new Error("Activités introuvables ou accès refusé.");

            setCamp(campData);
            setActivities(actData || []);
            setPlanningConfig(buildPlanningConfig(actData || []));

      } catch (e: any) {
          console.error("Erreur chargement planification :", e);
          setError(e.message || "Impossible de charger le planning.");
      }

      setLoading(false);
    }

    fetchData();
  }, [campId]);

  if (loading || !camp) {
    return (
      <CampLayout>
        <p className="text-gray-600">Chargement du planning…</p>
      </CampLayout>
    );
  }

  if (!planningConfig) {
    return (
      <CampLayout>
        <p className="text-gray-600">Chargement du planning…</p>
      </CampLayout>
    );
  }

  if (error) {
    return (
      <CampLayout>
        <p className="text-red-600">{error}</p>
      </CampLayout>
    );
  }

  // À partir d’ici, TS sait que planningConfig n’est plus null
  const config: PlanningConfig = planningConfig;

  const days = getDaysBetween(camp.start_date, camp.end_date);

  // Regrouper par jour
  const activitiesByDay: Record<string, Activity[]> = {};
  for (const activity of activities) {
    const dayKey = activity.start_time.slice(0, 10);
    if (!activitiesByDay[dayKey]) {
      activitiesByDay[dayKey] = [];
    }
    activitiesByDay[dayKey].push(activity);
  }

  /**
   * Double-clic sur une colonne jour → on ouvre le formulaire pré-rempli
   */
  function handleDayDoubleClick(dayKey: string, e: MouseEvent<HTMLDivElement>) {
    // sécurité runtime au cas où, pour éviter les crashs isolés
    if (!planningConfig) return;
    const cfg = planningConfig;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;

    // index de slot dans la grille
    let slotIndex = Math.floor(y / cfg.slotHeight);
    if (slotIndex < 0) slotIndex = 0;
    if (slotIndex > cfg.totalSlots - 1) {
      slotIndex = cfg.totalSlots - 1;
    }

    let minutesFromStart = slotIndex * cfg.slotMinutes;
    if (minutesFromStart < 0) minutesFromStart = 0;
    if (minutesFromStart > cfg.totalMinutes - cfg.slotMinutes) {
      minutesFromStart = cfg.totalMinutes - cfg.slotMinutes;
    }

    const totalStartMinutes = cfg.startMinutes + minutesFromStart;
    let totalEndMinutes = totalStartMinutes + 60; // 1h par défaut

    // ne pas dépasser la fin de la grille
    if (totalEndMinutes > cfg.endMinutes) {
      totalEndMinutes = cfg.endMinutes;
    }

    const startHour = Math.floor(totalStartMinutes / 60);
    const startMinute = totalStartMinutes % 60;
    const endHour = Math.floor(totalEndMinutes / 60);
    const endMinute = totalEndMinutes % 60;

    const startTimeStr =
      startHour.toString().padStart(2, "0") +
      ":" +
      startMinute.toString().padStart(2, "0");
    const endTimeStr =
      endHour.toString().padStart(2, "0") +
      ":" +
      endMinute.toString().padStart(2, "0");

    setCreateInfo({
      date: dayKey,
      startTime: startTimeStr,
      endTime: endTimeStr,
    });
  }

  async function reloadActivities() {
      setLoading(true); // Ajout d'un loading pour l'attente du rechargement
      try {
          const actData = await getCampActivities(campId);
          setActivities(actData || []);
          setPlanningConfig(buildPlanningConfig(actData || []));
      } catch (e) {
          console.error("Erreur rechargement activités (RPC):", e);
      }
      setLoading(false);
  }

  /**
   * Démarrage du drag vertical sur une activité (dans sa journée)
   */
  function handleActivityMouseDown(
    activity: Activity,
    dayKey: string,
    relStartMinutes: number,
    durationMinutes: number,
    e: MouseEvent<HTMLDivElement>
  ) {
    e.preventDefault();
    e.stopPropagation();

    setDrag({
      activityId: activity.id,
      dayKey,
      startClientY: e.clientY,
      initialStartMinutes: relStartMinutes,
      durationMinutes,
    });
  }

  /**
   * MouseUp sur la colonne du jour → on termine le drag si actif
   */
  async function handleDayMouseUp(
    dayKey: string,
    e: MouseEvent<HTMLDivElement>
  ) {
    if (!drag) return;
    if (drag.dayKey !== dayKey) {
      // version 1 : drag uniquement vertical dans la même journée
      setDrag(null);
      return;
    }

    if (!planningConfig) {
      setDrag(null);
      return;
    }
    const cfg = planningConfig;

    const deltaY = e.clientY - drag.startClientY;
    const deltaSlots = Math.round(deltaY / cfg.slotHeight);

    let newStartMinutes =
      drag.initialStartMinutes + deltaSlots * cfg.slotMinutes;

    if (newStartMinutes < 0) newStartMinutes = 0;
    if (newStartMinutes > cfg.totalMinutes - drag.durationMinutes) {
      newStartMinutes = cfg.totalMinutes - drag.durationMinutes;
    }

    const totalStartMinutes = cfg.startMinutes + newStartMinutes;
    const totalEndMinutes = totalStartMinutes + drag.durationMinutes;

    const startHour = Math.floor(totalStartMinutes / 60);
    const startMinute = totalStartMinutes % 60;
    const endHour = Math.floor(totalEndMinutes / 60);
    const endMinute = totalEndMinutes % 60;

    const startTimeStr =
      startHour.toString().padStart(2, "0") +
      ":" +
      startMinute.toString().padStart(2, "0");
    const endTimeStr =
      endHour.toString().padStart(2, "0") +
      ":" +
      endMinute.toString().padStart(2, "0");

    const newStartIso = `${dayKey}T${startTimeStr}:00`;
    const newEndIso = `${dayKey}T${endTimeStr}:00`;

    // 1) Mise à jour de l’activité déplacée
    const { error: updateError } = await supabase
      .from("activities")
      .update({
        start_time: newStartIso,
        end_time: newEndIso,
      })
      .eq("id", drag.activityId);

    if (updateError) {
      console.error("Erreur update activité (drag) :", updateError);
      alert("Erreur lors du déplacement de l’activité.");
      setDrag(null);
      return;
    }

    // 2) Recalcul automatique de index_in_day pour cette journée
    const nextDay = new Date(dayKey);
    nextDay.setDate(nextDay.getDate() + 1);

    // --- CORRECTION: UTILISER LA RPC POUR LA LECTURE DES ACTIVITÉS ---
    let dayActs: Activity[] = [];
    try {
      const allActs = await getCampActivities(campId);
      
      // Le reste du bloc reste inchangé
      dayActs = (allActs || [])
          .filter(a => a.start_time.startsWith(dayKey))
          .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  } catch (fetchDayErr) {
      console.error("Erreur récupération activités pour reindex (RPC) :", fetchDayErr);
  }
    // -----------------------------------------------------------------

    if (dayActs && dayActs.length > 0) { 
      // ... (le reste du code d'indexation et upsert reste inchangé) ...
      const updates = dayActs.map((a, idx) => ({
        id: a.id,
        index_in_day: idx + 1,
      }));

      // L'UPSERT fonctionne avec la Policy RLS UPDATE corrigée
      const { error: reindexErr } = await supabase
        .from("activities")
        .upsert(updates);
      if (reindexErr) {
        console.error("Erreur reindex index_in_day :", reindexErr);
      }
    }

    // 3) Rechargement global
    await reloadActivities();

    setDrag(null);
  }

  return (
    <CampLayout>
      <section className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Picasso</h1>
          <p className="text-gray-600">
            Vue planning des activités pour le camp{" "}
            <strong>{camp.name}</strong>.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Double-clique sur un créneau vide pour créer une activité.
            <br />
            Clique et glisse une activité verticalement pour changer son heure
            (recalcul automatique de l&apos;ordre dans la journée).
          </p>
        </header>

        <div className="border rounded-xl bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* En-têtes des jours */}
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `120px repeat(${days.length}, 1fr)`,
                }}
              >
                <div className="bg-gray-100 border-b border-r px-2 py-3 text-sm font-medium text-gray-600">
                  Heure
                </div>
                {days.map((day) => (
                  <div
                    key={day.key}
                    className="bg-gray-100 border-b px-2 py-3 text-sm font-semibold text-gray-700 text-center"
                  >
                    {day.label}
                  </div>
                ))}
              </div>

              {/* Corps : colonne heures + colonnes jours */}
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `120px repeat(${days.length}, 1fr)`,
                }}
              >
                {/* Colonne des heures */}
                <div className="border-r bg-gray-50">
                  {config.hours.map((hour) => (
                    <div
                      key={hour}
                      className="border-t px-2 text-sm text-gray-600 flex items-start"
                      style={{
                        height:
                          (60 / config.slotMinutes) * config.slotHeight,
                      }} // 1h = 4 slots si 15 min
                    >
                      {hour.toString().padStart(2, "0")}h
                    </div>
                  ))}
                </div>

                {/* Colonnes des jours */}
                {days.map((day) => {
                  const dayActivities = (activitiesByDay[day.key] || []).slice();

                  return (
                    <div
                      key={day.key}
                      className="border-l relative bg-white cursor-crosshair"
                      style={{
                        height: config.totalSlots * config.slotHeight,
                      }}
                      onDoubleClick={(e) => handleDayDoubleClick(day.key, e)}
                      onMouseUp={(e) => handleDayMouseUp(day.key, e)}
                    >
                      {/* Lignes de fond (heures) */}
                      {config.hours.map((hour, index) => (
                        <div
                          key={hour}
                          className="absolute left-0 right-0 border-t border-gray-100"
                          style={{
                            top:
                              index *
                              (60 / config.slotMinutes) *
                              config.slotHeight,
                          }}
                        />
                      ))}

                      {/* Activités positionnées */}
                      {dayActivities.map((activity) => {
                        const {
                          startMinutes,
                          durationMinutes,
                          top,
                          height,
                        } = computeActivityPlacement(
                          activity.start_time,
                          activity.end_time,
                          config
                        );

                        const bg = colorForRelation(
                          activity.relation_activity
                        );

                        return (
                          <div
                            key={activity.id}
                            className="absolute left-1 right-1 rounded-md px-2 py-1 text-xs text-white overflow-hidden cursor-pointer shadow-sm"
                            style={{ top, height, backgroundColor: bg }}
                            title={`${activity.name}
${activity.location ?? ""}${
                              activity.category
                                ? "\n" + activity.category
                                : ""
                            }`}
                            onMouseDown={(e) =>
                              handleActivityMouseDown(
                                activity,
                                day.key,
                                startMinutes,
                                durationMinutes,
                                e
                              )
                            }
                          >
                            <div className="font-semibold text-[11px] leading-tight">
                              {activity.name}
                            </div>
                            <div className="text-[10px] opacity-80">
                              {activity.category && (
                                <span>{activity.category}</span>
                              )}
                              {activity.location && (
                                <span>
                                  {activity.category ? " · " : ""}
                                  {activity.location}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {activities.length === 0 && (
          <p className="mt-4 text-gray-600">
            Aucune activité pour le moment. Ajoute des activités depuis l’onglet{" "}
            <strong>Activités</strong> ou en double-cliquant dans le planning.
          </p>
        )}
      </section>

      {/* Modal de création d’activité depuis Picasso */}
      <CreateActivityModal
        open={createInfo !== null}
        onClose={() => setCreateInfo(null)}
        campId={campId}
        defaultDate={createInfo?.date ?? ""}
        defaultStartTime={createInfo?.startTime ?? ""}
        defaultEndTime={createInfo?.endTime ?? ""}
        onCreated={reloadActivities}
      />
    </CampLayout>
  );
}
