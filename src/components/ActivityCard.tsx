import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import StatusBadge from "./StatusBadge";
import { formatDuration, formatParticipants } from "../lib/format";
import {
  currentLanguage,
  localizedName,
  type ContentLanguage,
} from "../i18n/languages";
import type { Activity, LocationType } from "../types";

type ActivityCardProps = {
  activity: Activity;
  showStatus?: boolean;
  // Pour les listes qui mélangent plusieurs auteurs (ex. archives)
  showAuthor?: boolean;
};

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export default function ActivityCard({
  activity,
  showStatus = false,
  showAuthor = false,
}: ActivityCardProps) {
  const { t } = useTranslation();
  const details = [
    formatDuration(activity.duration_minutes),
    formatParticipants(activity.min_participants, activity.max_participants),
    activity.location_type
      ? t(`locations.${activity.location_type as LocationType}`)
      : null,
  ].filter(Boolean);

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border bg-white text-gray-900 shadow-sm transition hover:shadow-md">
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
            {activity.activity_type && localizedName(activity.activity_type)}
          </p>
          <div className="flex gap-1">
            {/* Langue du contenu, signalée si ce n'est pas celle de l'interface */}
            {activity.language !== currentLanguage() && (
              <span
                lang={activity.language}
                title={t(`language.${activity.language as ContentLanguage}`)}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold uppercase text-gray-700"
              >
                {activity.language}
              </span>
            )}
            {showStatus && <StatusBadge status={activity.status} />}
          </div>
        </div>

        <h3 className="mt-1 text-lg font-semibold" lang={activity.language}>
          {activity.title}
        </h3>

        {showAuthor && activity.author && (
          <p className="text-xs text-gray-500">
            {t("common.by", { name: activity.author.display_name })}
          </p>
        )}

        {details.length > 0 && (
          <p className="mt-1 text-sm text-gray-600">{details.join(" · ")}</p>
        )}

        {activity.description && (
          <p className="mt-2 text-sm text-gray-600" lang={activity.language}>
            {truncate(activity.description, 120)}
          </p>
        )}

        {activity.characteristic_forms.length > 0 && (
          // Intitulés trop longs pour la carte : numéro + intitulé au survol
          <ul
            className="mt-3 flex flex-wrap gap-1"
            aria-label={t("card.formsLabel")}
          >
            {activity.characteristic_forms.map((form) => (
              <li
                key={form.id}
                title={localizedName(form)}
                className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
              >
                {t("card.formBadge", { position: form.position })}
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
                {localizedName(branch)}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pt-4">
          <Link
            to={`/activites/${activity.id}`}
            className="inline-block px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            {t("card.view")}
          </Link>
        </div>
      </div>
    </article>
  );
}
