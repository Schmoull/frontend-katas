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
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("myActivities.title")}
          </h1>
          <Link
            to="/activites/nouvelle"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            {t("myActivities.newActivity")}
          </Link>
        </header>

        <div className="mb-6 flex flex-wrap gap-2">
          {(["", ...ACTIVITY_STATUSES] as const).map((status) => (
            <button
              key={status || "all"}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusFilter === status
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-indigo-100"
              }`}
            >
              {status ? t(`statuses.${status}`) : t("myActivities.all")}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-600">{t("common.loading")}</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : visible.length === 0 ? (
          <p className="text-gray-600">
            {activities.length === 0
              ? t("myActivities.empty")
              : t("myActivities.emptyStatus")}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} showStatus />
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  );
}
