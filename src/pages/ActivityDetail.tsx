import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MainLayout from "../layouts/MainLayout";
import StatusBadge from "../components/StatusBadge";
import FavoriteButton from "../components/FavoriteButton";
import { activityPermissions } from "../lib/permissions";
import { useAuth } from "../contexts/useAuth";
import {
  deleteActivity,
  getActivity,
  setActivityStatus,
} from "../services/activitiesService";
import {
  errorMessage,
  formatAgeBranch,
  formatDate,
  formatDuration,
  formatParticipants,
} from "../lib/format";
import { localizedName, type ContentLanguage } from "../i18n/languages";
import type { Activity, ActivityStatus, LocationType } from "../types";

// Le contenu est dans la langue de l'activité : attribut lang pour les
// lecteurs d'écran et la césure
function Section({
  title,
  text,
  lang,
}: {
  title: string;
  text: string | null;
  lang: string;
}) {
  if (!text) return null;
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 whitespace-pre-line text-gray-700" lang={lang}>
        {text}
      </p>
    </div>
  );
}

const secondaryButton =
  "px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50";

export default function ActivityDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    getActivity(id)
      .then((data) => {
        if (!cancelled) setActivity(data);
      })
      .catch((e) => {
        console.error("Erreur chargement activité :", e);
        if (!cancelled) setError(t("common.loadActivityError"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // user?.id : une activité en brouillon devient visible après connexion
  }, [id, user?.id, t]);

  async function changeStatus(status: ActivityStatus) {
    if (!activity) return;
    setBusy(true);
    try {
      await setActivityStatus(activity.id, status);
      setActivity(await getActivity(activity.id));
    } catch (e) {
      alert(errorMessage(e, t("detail.statusError")));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!activity) return;
    if (!confirm(t("detail.deleteConfirm", { title: activity.title }))) return;
    setBusy(true);
    try {
      await deleteActivity(activity.id);
      // Un administrateur peut supprimer l'activité d'un autre
      navigate(activity.created_by === user?.id ? "/mes-activites" : "/");
    } catch (e) {
      alert(errorMessage(e, t("detail.deleteError")));
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <p className="text-gray-600">{t("common.loading")}</p>
      </MainLayout>
    );
  }

  if (error || !activity) {
    return (
      <MainLayout>
        <p className="text-red-600">{error ?? t("common.activityNotFound")}</p>
        <Link
          to="/"
          className="mt-4 inline-block text-indigo-600 hover:underline"
        >
          {t("common.backToCatalog")}
        </Link>
      </MainLayout>
    );
  }

  const can = activityPermissions(activity, user?.id, profile?.role);
  const lang = activity.language;

  const facts = [
    {
      label: t("detail.duration"),
      value: formatDuration(activity.duration_minutes),
    },
    {
      label: t("detail.participants"),
      value: formatParticipants(
        activity.min_participants,
        activity.max_participants,
      ),
    },
    {
      label: t("detail.location"),
      value: activity.location_type
        ? t(`locations.${activity.location_type as LocationType}`)
        : null,
    },
    {
      label: t("detail.ageBranches"),
      value: activity.age_branches.map(formatAgeBranch).join(", ") || null,
    },
    {
      label: t("detail.language"),
      value: t(`language.${lang as ContentLanguage}`),
    },
  ].filter((fact) => fact.value);

  return (
    <MainLayout>
      <article className="max-w-3xl mx-auto space-y-6">
        <header className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              {activity.activity_type && localizedName(activity.activity_type)}
            </p>
            {activity.status !== "published" && (
              <StatusBadge status={activity.status} />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900" lang={lang}>
            {activity.title}
          </h1>
          <p className="text-sm text-gray-500">
            {t("common.by", {
              name: activity.author?.display_name ?? t("common.unknownAuthor"),
            })}
            {activity.published_at &&
              t("detail.publishedOn", {
                date: formatDate(activity.published_at),
              })}
          </p>
        </header>

        <div className="flex flex-wrap gap-2">
          {user && <FavoriteButton activityId={activity.id} />}
          {can.canEdit && (
            <Link
              to={`/activites/${activity.id}/modifier`}
              className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {t("common.edit")}
            </Link>
          )}
          {can.canPublish && (
            <button
              disabled={busy}
              onClick={() => changeStatus("published")}
              className={secondaryButton}
            >
              {t("detail.publish")}
            </button>
          )}
          {can.canUnpublish && (
            <button
              disabled={busy}
              onClick={() => changeStatus("draft")}
              className={secondaryButton}
            >
              {t("detail.unpublish")}
            </button>
          )}
          {can.canArchive && (
            <button
              disabled={busy}
              onClick={() => changeStatus("archived")}
              className={secondaryButton}
            >
              {t("detail.archive")}
            </button>
          )}
          {can.canDelete && (
            <button
              disabled={busy}
              onClick={handleDelete}
              className="px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {t("common.delete")}
            </button>
          )}
        </div>

        {facts.length > 0 && (
          <dl className="grid gap-4 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-2">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-sm text-gray-500">{fact.label}</dt>
                <dd className="font-medium">{fact.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {activity.characteristic_forms.length > 0 && (
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("detail.characteristicForms")}
            </h2>
            <ul className="mt-2 space-y-1 text-gray-700">
              {activity.characteristic_forms.map((form) => (
                <li key={form.id}>
                  <span className="font-semibold">{form.position}.</span>{" "}
                  {localizedName(form)}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-6 rounded-xl bg-white p-6 shadow-sm">
          <Section
            title={t("detail.description")}
            text={activity.description}
            lang={lang}
          />
          <Section
            title={t("detail.objective")}
            text={activity.pedagogical_objective}
            lang={lang}
          />
          <Section
            title={t("detail.material")}
            text={activity.material_needed}
            lang={lang}
          />
          <Section
            title={t("detail.safety")}
            text={activity.safety_notes}
            lang={lang}
          />
          <Section
            title={t("detail.theme")}
            text={activity.narrative_theme}
            lang={lang}
          />
          <Section
            title={t("detail.themeAdaptation")}
            text={activity.theme_adaptation_notes}
            lang={lang}
          />
        </div>
      </article>
    </MainLayout>
  );
}
