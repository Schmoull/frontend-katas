import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MainLayout from "../layouts/MainLayout";
import ActivityCard from "../components/ActivityCard";
import { useAuth } from "../contexts/useAuth";
import { listMyActivities } from "../services/activitiesService";
import {
  ACTIVITY_STATUSES,
  type Activity,
  type ActivityStatus,
} from "../types";

export default function MyActivities() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = user?.id;

  const [activities, setActivities] = useState<Activity[]>([]);
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    listMyActivities(userId)
      .then((data) => {
        if (!cancelled) setActivities(data);
      })
      .catch((e) => {
        console.error("Erreur chargement de mes activités :", e);
        if (!cancelled) setError(t("myActivities.loadError"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, t]);

  const visible = statusFilter
    ? activities.filter((a) => a.status === statusFilter)
    : activities;

  return (
    <MainLayout>
      <section>
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h1 className="titre-1">{t("myActivities.title")}</h1>
          <Link to="/activites/nouvelle" className="btn btn-principal">
            {t("myActivities.newActivity")}
          </Link>
        </header>

        <div className="mb-6 flex flex-wrap gap-2">
          {(["", ...ACTIVITY_STATUSES] as const).map((status) => (
            <button
              key={status || "all"}
              type="button"
              onClick={() => setStatusFilter(status)}
              aria-pressed={statusFilter === status}
              className="choix"
            >
              {status ? t(`statuses.${status}`) : t("myActivities.all")}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="corps text-encre-douce">{t("common.loading")}</p>
        ) : error ? (
          <p role="alert" className="corps-fort text-danger">
            {error}
          </p>
        ) : visible.length === 0 ? (
          <p className="corps text-encre-douce">
            {activities.length === 0
              ? t("myActivities.empty")
              : t("myActivities.emptyStatus")}
          </p>
        ) : (
          <div className="grille-fiches">
            {visible.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} showStatus />
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  );
}
