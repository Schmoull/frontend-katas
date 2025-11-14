import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CampLayout from "../layouts/CampLayout";
import { supabase } from "../lib/supabaseClient";

type Camp = {
  id: number;
  name: string;
  start_date: string; // ex: "2025-07-03"
  end_date: string;
};

type Activity = {
  id: number;
  name: string;
  category: string | null;
  relation_activity: string | null;
  start_time: string; // timestamp ISO
  end_time: string;
  location: string | null;
};

type Day = {
  key: string;   // "2025-07-03"
  label: string; // "lun. 3 juillet"
};

const HOURS = Array.from({ length: 15 }, (_, i) => 8 + i); // 08h -> 22h

function formatDayLabel(d: Date): string {
  return d.toLocaleDateString("fr-CH", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });
}

function getDaysBetween(start: string, end: string): Day[] {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const days: Day[] = [];

  // Normalisation (on ignore l'heure)
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  const d = new Date(startDate);
  while (d <= endDate) {
    const key = d.toISOString().slice(0, 10); // "YYYY-MM-DD"
    days.push({ key, label: formatDayLabel(d) });
    d.setDate(d.getDate() + 1);
  }
  return days;
}

export default function CampPlanning() {
  const { id } = useParams<{ id: string }>();
  const campId = Number(id);

  const [camp, setCamp] = useState<Camp | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campId) return;

    async function fetchData() {
      setLoading(true);
      setError(null);

      // On charge le camp et ses activités en parallèle
      const [{ data: campData, error: campError }, { data: actData, error: actError }] =
        await Promise.all([
          supabase.from("camps").select("id, name, start_date, end_date").eq("id", campId).single(),
          supabase
            .from("activities")
            .select("id, name, category, relation_activity, start_time, end_time, location")
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

  if (error) {
    return (
      <CampLayout>
        <p className="text-red-600">{error}</p>
      </CampLayout>
    );
  }

  const days = getDaysBetween(camp.start_date, camp.end_date);

  // Regrouper les activités par jour (clé: "YYYY-MM-DD")
  const activitiesByDay: Record<string, Activity[]> = {};
  for (const activity of activities) {
    const dayKey = activity.start_time.slice(0, 10);
    if (!activitiesByDay[dayKey]) {
      activitiesByDay[dayKey] = [];
    }
    activitiesByDay[dayKey].push(activity);
  }

  // Fonction utilitaire : récupère les activités qui démarrent à telle heure pour un jour donné
  function getActivitiesForDayAndHour(dayKey: string, hour: number): Activity[] {
    const list = activitiesByDay[dayKey] || [];
    return list.filter((act) => {
      const d = new Date(act.start_time);
      return d.getHours() === hour;
    });
  }

  return (
    <CampLayout>
      <section className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Picasso</h1>
          <p className="text-gray-600">
            Vue planning des activités pour le camp <strong>{camp.name}</strong>.
          </p>
        </header>

        <div className="border rounded-xl bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* En-têtes des jours */}
              <div className="grid" style={{ gridTemplateColumns: `120px repeat(${days.length}, 1fr)` }}>
                {/* Colonne heures vide */}
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

              {/* Lignes par heure */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="grid"
                  style={{ gridTemplateColumns: `120px repeat(${days.length}, 1fr)` }}
                >
                  {/* Colonne des heures */}
                  <div className="border-t border-r px-2 py-4 text-sm text-gray-600 bg-gray-50">
                    {hour.toString().padStart(2, "0")}h00
                  </div>

                  {/* Colonnes jours */}
                  {days.map((day) => {
                    const slotActivities = getActivitiesForDayAndHour(day.key, hour);

                    return (
                      <div
                        key={day.key}
                        className="border-t px-1 py-1 align-top min-h-[64px] bg-white"
                      >
                        {slotActivities.map((activity) => (
                          <div
                            key={activity.id}
                            className="mb-1 rounded-md px-2 py-1 text-xs text-white cursor-pointer"
                            style={{
                              backgroundColor:
                                activity.relation_activity === "A la personnalité"
                                  ? "#f1c40f"
                                  : activity.relation_activity === "Au corps"
                                  ? "#3498db"
                                  : activity.relation_activity === "A l'environnement"
                                  ? "#2ecc71"
                                  : activity.relation_activity === "Aux autres"
                                  ? "#e91e63"
                                  : activity.relation_activity === "Au spirituel"
                                  ? "#e74c3c"
                                  : "#7f8c8d",
                            }}
                            title={`${activity.name}\n${activity.location ?? ""}\n${
                              activity.category ?? ""
                            }`}
                          >
                            <div className="font-semibold truncate">{activity.name}</div>
                            <div className="text-[10px] opacity-90">
                              {activity.location && <span>{activity.location}</span>}
                              {activity.category && (
                                <span>{activity.location ? " · " : ""}{activity.category}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {activities.length === 0 && (
          <p className="mt-4 text-gray-600">
            Aucune activité pour le moment. Ajoute des activités depuis l’onglet{" "}
            <strong>Activités</strong> pour les voir apparaître ici.
          </p>
        )}
      </section>
    </CampLayout>
  );
}
