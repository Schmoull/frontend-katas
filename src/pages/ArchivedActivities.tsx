import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import ActivityCard from "../components/ActivityCard";
import { listArchivedActivities } from "../services/activitiesService";
import type { Activity } from "../types";

// Réservée aux modérateurs et administrateurs (route + RLS)
export default function ArchivedActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    listArchivedActivities()
      .then((data) => {
        if (!cancelled) setActivities(data);
      })
      .catch((e) => {
        console.error("Erreur chargement des archives :", e);
        if (!cancelled) setError("Impossible de charger les archives.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Recherche locale : la liste des archives reste courte
  const query = search.trim().toLowerCase();
  const visible = query
    ? activities.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.author?.display_name.toLowerCase().includes(query),
      )
    : activities;

  return (
    <MainLayout>
      <section>
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Activités archivées
          </h1>
          <p className="text-gray-600">
            Les activités retirées du catalogue. Ouvre une activité pour la
            republier.
          </p>
        </header>

        <input
          type="search"
          placeholder="Rechercher par titre ou auteur…"
          aria-label="Rechercher par titre ou auteur"
          className="mb-6 w-full max-w-md border border-gray-300 rounded-md p-2 bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <p className="text-gray-600">Chargement…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : visible.length === 0 ? (
          <p className="text-gray-600">
            {activities.length === 0
              ? "Aucune activité archivée."
              : "Aucune activité archivée ne correspond."}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} showAuthor />
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  );
}
