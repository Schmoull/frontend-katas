import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MainLayout from "../layouts/MainLayout";
import ActivityCard from "../components/ActivityCard";
import { listFavoriteActivities } from "../services/favoritesService";
import type { Activity } from "../types";

export default function Favorites() {
  const { t } = useTranslation();
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
        if (!cancelled) setError(t("favorites.loadError"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [t]);

  return (
    <MainLayout>
      <section>
        <h1 className="titre-1 mb-6">{t("favorites.title")}</h1>

        {loading ? (
          <p className="corps text-encre-douce">{t("common.loading")}</p>
        ) : error ? (
          <p role="alert" className="corps-fort text-danger">
            {error}
          </p>
        ) : activities.length === 0 ? (
          <p className="corps text-encre-douce">{t("favorites.empty")}</p>
        ) : (
          <div className="grille-fiches">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  );
}
