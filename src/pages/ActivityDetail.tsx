import { useEffect, useState, type ReactNode } from "react";
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
import { activityTypeStyle } from "../lib/activityTypeStyle";
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
    <section>
      <h2 className="titre-3">{title}</h2>
      <p className="corps mt-2 whitespace-pre-line" lang={lang}>
        {text}
      </p>
    </section>
  );
}

// Retour au catalogue, pour les pages d'erreur
function BackLink() {
  const { t } = useTranslation();
  return (
    <Link to="/" className="btn btn-discret mt-4">
      {t("common.backToCatalog")}
    </Link>
  );
}

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
        <p className="corps text-encre-douce">{t("common.loading")}</p>
      </MainLayout>
    );
  }

  if (error || !activity) {
    return (
      <MainLayout>
        <p role="alert" className="corps-fort text-danger">
          {error ?? t("common.activityNotFound")}
        </p>
        <BackLink />
      </MainLayout>
    );
  }

  const can = activityPermissions(activity, user?.id, profile?.role);
  const lang = activity.language;
  const typeStyle = activityTypeStyle(activity.activity_type?.name);

  const facts: { label: string; value: ReactNode }[] = [
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
      value:
        activity.age_branches.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {activity.age_branches.map((branch) => (
              <li key={branch.id} className="pastille-branche">
                {formatAgeBranch(branch)}
              </li>
            ))}
          </ul>
        ) : null,
    },
    {
      label: t("detail.language"),
      value: t(`language.${lang as ContentLanguage}`),
    },
  ].filter((fact) => fact.value);

  return (
    <MainLayout>
      <article className="mx-auto max-w-3xl space-y-8">
        <header className="bg-papier-clair shadow-posee">
          <div className={`fiche-tete h-20 ${typeStyle.className}`}>
            <span className="etiquette-type">
              {typeStyle.pictogram && (
                <img src={typeStyle.pictogram} alt="" className="size-10" />
              )}
              {activity.activity_type && localizedName(activity.activity_type)}
            </span>
            {activity.status !== "published" && (
              <StatusBadge status={activity.status} />
            )}
          </div>
          <div className="space-y-2 p-6">
            <h1 className="titre-1 text-4xl md:text-5xl" lang={lang}>
              {activity.title}
            </h1>
            <p className="legende text-encre-discrete">
              {t("common.by", {
                name:
                  activity.author?.display_name ?? t("common.unknownAuthor"),
              })}
              {activity.published_at &&
                t("detail.publishedOn", {
                  date: formatDate(activity.published_at),
                })}
            </p>
          </div>
        </header>

        <div className="flex flex-wrap gap-2">
          {can.canPublish && (
            <button
              type="button"
              disabled={busy}
              onClick={() => changeStatus("published")}
              className="btn btn-principal"
            >
              {t("detail.publish")}
            </button>
          )}
          {can.canEdit && (
            <Link
              to={`/activites/${activity.id}/modifier`}
              className="btn btn-secondaire"
            >
              {t("common.edit")}
            </Link>
          )}
          {user && <FavoriteButton activityId={activity.id} />}
          {can.canUnpublish && (
            <button
              type="button"
              disabled={busy}
              onClick={() => changeStatus("draft")}
              className="btn btn-contour"
            >
              {t("detail.unpublish")}
            </button>
          )}
          {can.canArchive && (
            <button
              type="button"
              disabled={busy}
              onClick={() => changeStatus("archived")}
              className="btn btn-contour"
            >
              {t("detail.archive")}
            </button>
          )}
          {can.canDelete && (
            <button
              type="button"
              disabled={busy}
              onClick={handleDelete}
              className="btn btn-danger"
            >
              {t("common.delete")}
            </button>
          )}
        </div>

        {facts.length > 0 && (
          <dl className="grid gap-x-6 gap-y-4 bg-papier-fonce p-6 sm:grid-cols-2">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="surtitre text-encre-douce">{fact.label}</dt>
                <dd className="donnee mt-1">{fact.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {activity.characteristic_forms.length > 0 && (
          <section>
            <h2 className="titre-3">{t("detail.characteristicForms")}</h2>
            <ul className="mt-3 space-y-2">
              {activity.characteristic_forms.map((form) => (
                <li key={form.id} className="flex items-start gap-3">
                  <span className="badge-js shrink-0">
                    <span>
                      {t("card.formBadge", { position: form.position })}
                    </span>
                  </span>
                  <span className="corps">{localizedName(form)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="space-y-8 bg-papier-clair p-6 shadow-posee md:p-8">
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
