import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { formatDuration, formatParticipants } from "../lib/format";
import { LOCATION_LABELS, type Activity, type LocationType } from "../types";

type ActivityCardProps = {
  activity: Activity;
  showStatus?: boolean;
};

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export default function ActivityCard({
  activity,
  showStatus = false,
}: ActivityCardProps) {
  const details = [
    formatDuration(activity.duration_minutes),
    formatParticipants(activity.min_participants, activity.max_participants),
    activity.location_type
      ? LOCATION_LABELS[activity.location_type as LocationType]
      : null,
  ].filter(Boolean);

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border bg-white text-gray-900 shadow-sm transition hover:shadow-md">
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
            {activity.activity_type?.name}
          </p>
          {showStatus && <StatusBadge status={activity.status} />}
        </div>

        <h3 className="mt-1 text-lg font-semibold">{activity.title}</h3>

        {details.length > 0 && (
          <p className="mt-1 text-sm text-gray-600">{details.join(" · ")}</p>
        )}

        {activity.description && (
          <p className="mt-2 text-sm text-gray-600">
            {truncate(activity.description, 120)}
          </p>
        )}

        {activity.characteristic_forms.length > 0 && (
          // Intitulés trop longs pour la carte : numéro + intitulé au survol
          <ul
            className="mt-3 flex flex-wrap gap-1"
            aria-label="Formes caractéristiques"
          >
            {activity.characteristic_forms.map((form) => (
              <li
                key={form.id}
                title={form.name}
                className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
              >
                FC {form.position}
              </li>
            ))}
          </ul>
        )}

        {activity.age_branches.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1">
            {activity.age_branches.map((branch) => (
              <li
                key={branch.id}
                className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700"
              >
                {branch.name}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pt-4">
          <Link
            to={`/activites/${activity.id}`}
            className="inline-block px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            Voir l'activité
          </Link>
        </div>
      </div>
    </article>
  );
}
