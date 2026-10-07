import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import {
  LOCATION_LABELS,
  type Activity,
  type ActivityStatus,
  type LocationType,
} from "../types";

function Section({ title, text }: { title: string; text: string | null }) {
  if (!text) return null;
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 whitespace-pre-line text-gray-700">{text}</p>
    </div>
  );
}

const secondaryButton =
  "px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50";

export default function ActivityDetail() {
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
        if (!cancelled) setError("Impossible de charger l'activité.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // user?.id : une activité en brouillon devient visible après connexion
  }, [id, user?.id]);

  async function changeStatus(status: ActivityStatus) {
    if (!activity) return;
    setBusy(true);
    try {
      await setActivityStatus(activity.id, status);
      setActivity(await getActivity(activity.id));
    } catch (e) {
      alert(errorMessage(e, "Impossible de changer le statut."));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!activity) return;
    if (!confirm(`Supprimer définitivement « ${activity.title} » ?`)) return;
    setBusy(true);
    try {
      await deleteActivity(activity.id);
      // Un administrateur peut supprimer l'activité d'un autre
      navigate(activity.created_by === user?.id ? "/mes-activites" : "/");
    } catch (e) {
      alert(errorMessage(e, "Impossible de supprimer l'activité."));
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <p className="text-gray-600">Chargement…</p>
      </MainLayout>
    );
  }

  if (error || !activity) {
    return (
      <MainLayout>
        <p className="text-red-600">{error ?? "Activité introuvable."}</p>
        <Link
          to="/"
          className="mt-4 inline-block text-indigo-600 hover:underline"
        >
          ← Retour au catalogue
        </Link>
      </MainLayout>
    );
  }

  const can = activityPermissions(activity, user?.id, profile?.role);

  const facts = [
    { label: "Durée", value: formatDuration(activity.duration_minutes) },
    {
      label: "Participants",
      value: formatParticipants(
        activity.min_participants,
        activity.max_participants,
      ),
    },
    {
      label: "Lieu",
      value: activity.location_type
        ? LOCATION_LABELS[activity.location_type as LocationType]
        : null,
    },
    {
      label: "Tranches d'âge",
      value: activity.age_branches.map(formatAgeBranch).join(", ") || null,
    },
  ].filter((fact) => fact.value);

  return (
    <MainLayout>
      <article className="max-w-3xl mx-auto space-y-6">
        <header className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              {activity.activity_type?.name}
            </p>
            {activity.status !== "published" && (
              <StatusBadge status={activity.status} />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{activity.title}</h1>
          <p className="text-sm text-gray-500">
            Par {activity.author?.display_name ?? "un·e auteur·rice inconnu·e"}
            {activity.published_at &&
              ` · publiée le ${formatDate(activity.published_at)}`}
          </p>
        </header>

        <div className="flex flex-wrap gap-2">
          {user && <FavoriteButton activityId={activity.id} />}
          {can.canEdit && (
            <Link
              to={`/activites/${activity.id}/modifier`}
              className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Modifier
            </Link>
          )}
          {can.canPublish && (
            <button
              disabled={busy}
              onClick={() => changeStatus("published")}
              className={secondaryButton}
            >
              Publier
            </button>
          )}
          {can.canUnpublish && (
            <button
              disabled={busy}
              onClick={() => changeStatus("draft")}
              className={secondaryButton}
            >
              Repasser en brouillon
            </button>
          )}
          {can.canArchive && (
            <button
              disabled={busy}
              onClick={() => changeStatus("archived")}
              className={secondaryButton}
            >
              Archiver
            </button>
          )}
          {can.canDelete && (
            <button
              disabled={busy}
              onClick={handleDelete}
              className="px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              Supprimer
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
              Formes caractéristiques
            </h2>
            <ul className="mt-2 space-y-1 text-gray-700">
              {activity.characteristic_forms.map((form) => (
                <li key={form.id}>
                  <span className="font-semibold">{form.position}.</span>{" "}
                  {form.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-6 rounded-xl bg-white p-6 shadow-sm">
          <Section title="Description" text={activity.description} />
          <Section
            title="Objectif pédagogique"
            text={activity.pedagogical_objective}
          />
          <Section title="Matériel" text={activity.material_needed} />
          <Section title="Sécurité" text={activity.safety_notes} />
          <Section title="Thème narratif" text={activity.narrative_theme} />
          <Section
            title="Adapter le thème"
            text={activity.theme_adaptation_notes}
          />
        </div>
      </article>
    </MainLayout>
  );
}
