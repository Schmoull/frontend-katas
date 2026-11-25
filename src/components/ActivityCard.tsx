import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import StatusBadge from "./StatusBadge";
import { activityTypeStyle } from "../lib/activityTypeStyle";
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

export default function ActivityCard({
  activity,
  showStatus = false,
  showAuthor = false,
}: ActivityCardProps) {
  const { t } = useTranslation();
  const typeStyle = activityTypeStyle(activity.activity_type?.name);
  const forms = activity.characteristic_forms;

  // Données absentes : la puce est simplement omise
  const details = [
    formatDuration(activity.duration_minutes),
    formatParticipants(activity.min_participants, activity.max_participants),
    activity.location_type
      ? t(`locations.${activity.location_type as LocationType}`)
      : null,
  ].filter(Boolean);

  return (
    <article className="fiche">
      <div className={`fiche-tete ${typeStyle.className}`}>
        <span className="etiquette-type">
          {typeStyle.pictogram && <img src={typeStyle.pictogram} alt="" />}
          {activity.activity_type && localizedName(activity.activity_type)}
        </span>

        {forms.length > 0 && (
          // Intitulés trop longs pour la fiche : numéros + intitulés au survol
          <span
            className="badge-js shrink-0"
            title={`${t("card.formsLabel")} : ${forms
              .map((form) => `${form.position}. ${localizedName(form)}`)
              .join(" ; ")}`}
          >
            <span>
              J+S ·{" "}
              {forms
                .map((form) => t("card.formBadge", { position: form.position }))
                .join(", ")}
            </span>
          </span>
        )}
      </div>

      <div className="fiche-corps">
        {(showStatus || activity.language !== currentLanguage()) && (
          <div className="flex flex-wrap gap-2">
            {/* Langue du contenu, signalée si ce n'est pas celle de l'interface */}
            {activity.language !== currentLanguage() && (
              <span
                lang={activity.language}
                title={t(`language.${activity.language as ContentLanguage}`)}
                className="inline-flex h-7 items-center border-2 border-encre px-2 font-titre text-sm font-bold uppercase tracking-wider"
              >
                {activity.language}
              </span>
            )}
            {showStatus && <StatusBadge status={activity.status} />}
          </div>
        )}

        <h3 className="fiche-titre" lang={activity.language}>
          {activity.title}
        </h3>

        {showAuthor && activity.author && (
          <p className="legende -mt-1 text-encre-discrete">
            {t("common.by", { name: activity.author.display_name })}
          </p>
        )}

        {details.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {details.map((detail) => (
              <li key={detail} className="puce-donnee">
                {detail}
              </li>
            ))}
          </ul>
        )}

        {activity.description && (
          <p className="fiche-resume" lang={activity.language}>
            {activity.description}
          </p>
        )}

        {activity.age_branches.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {activity.age_branches.map((branch) => (
              <li key={branch.id} className="pastille-branche">
                {localizedName(branch)}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="fiche-pied">
        <Link
          to={`/activites/${activity.id}`}
          className="btn btn-secondaire h-11 flex-1 justify-between"
        >
          {t("card.view")}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 12h16M14 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
