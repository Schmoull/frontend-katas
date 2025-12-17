import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import CreateActivityModal from "../features/planning/CreateActivityModal";
import { useParams } from "react-router-dom";
import CampLayout from "../layouts/CampLayout";
import { supabase } from "../lib/supabaseClient";
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

      const [
        { data: campData, error: campError },
        { data: actData, error: actError },
      ] = await Promise.all([
        supabase
          .from("camps")
          .select("id, name, start_date, end_date")
          .eq("id", campId)
          .single(),
        supabase
          .from("activities")
          .select(
            "id, name, relation_activity, category, start_time, end_time, location, index_in_day"
          )
          .eq("camp_id", campId)
          .order("start_time", { ascending: true }),
      ]);

      if (campError || !campData) {
        console.error("Erreur chargement camp :", campError);
        setError("Impossible de charger le camp.");
        setLoading(false);
        return;
      }

      if (actError) {
        console.error("Erreur chargement activités :", actError);
        setError("Impossible de charger les activités.");
        setLoading(false);
        return;
      }

      setCamp(campData);
      setActivities(actData || []);
      setPlanningConfig(buildPlanningConfig(actData || []));
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
    const { data: actData, error: actError } = await supabase
      .from("activities")
      .select(
        "id, name, relation_activity, category, start_time, end_time, location, index_in_day"
      )
      .eq("camp_id", campId)
      .order("start_time", { ascending: true });

    if (actError) {
      console.error("Erreur rechargement activités :", actError);
      return;
    }
    setActivities(actData || []);
    setPlanningConfig(buildPlanningConfig(actData || []));
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
    const nextDayKey = nextDay.toISOString().slice(0, 10);

    const { data: dayActs, error: fetchDayErr } = await supabase
      .from("activities")
      .select("id, start_time")
      .eq("camp_id", campId)
      .gte("start_time", `${dayKey}T00:00:00`)
      .lt("start_time", `${nextDayKey}T00:00:00`)
      .order("start_time", { ascending: true });

    if (fetchDayErr) {
      console.error(
        "Erreur récupération activités pour reindex :",
        fetchDayErr
      );
    } else if (dayActs) {
      const updates = dayActs.map((a, idx) => ({
        id: a.id,
        index_in_day: idx + 1,
      }));

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
