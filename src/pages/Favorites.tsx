import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import ActivityCard from "../components/ActivityCard";
import { listFavoriteActivities } from "../services/favoritesService";
import type { Activity } from "../types";

export default function Favorites() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    listFavoriteActivities()
      .then((data) => {
        if (!cancelled) setActivities(data);
      })
      .catch((e) => {
        console.error("Erreur chargement des favoris :", e);
        if (!cancelled) setError("Impossible de charger tes favoris.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <MainLayout>
      <section>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes favoris</h1>

        {loading ? (
          <p className="text-gray-600">Chargement…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : activities.length === 0 ? (
          <p className="text-gray-600">
            Aucun favori pour l'instant. Ajoute des activités depuis leur fiche.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  );
}
