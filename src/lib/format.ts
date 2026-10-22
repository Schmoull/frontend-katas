// src/lib/format.ts
// Textes dans la langue active. Les composants qui les appellent passent
// par useTranslation : ils se ré-affichent quand la langue change.
import i18n from "i18next";
import type { Translation } from "../i18n/fr";
import { LOCALES, currentLanguage, localizedName } from "../i18n/languages";
import type { AgeBranch } from "../types";

export function formatDuration(minutes: number | null): string | null {
  if (minutes == null) return null;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return i18n.t("format.durationMinutes", { minutes: rest });
  return rest === 0
    ? i18n.t("format.durationHours", { hours })
    : i18n.t("format.durationHoursMinutes", {
        hours,
        minutes: String(rest).padStart(2, "0"),
      });
}

export function formatParticipants(
  min: number | null,
  max: number | null,
): string | null {
  if (min != null && max != null)
    return min === max
      ? i18n.t("format.participantsExact", { count: min })
      : i18n.t("format.participantsRange", { min, max });
  if (min != null) return i18n.t("format.participantsMin", { count: min });
  if (max != null) return i18n.t("format.participantsMax", { count: max });
  return null;
}

// max_age = 99 signifie « pas de limite d'âge » (ex. Routiers)
const NO_MAX_AGE = 99;

export function formatAgeBranch(
  branch: Pick<AgeBranch, "name" | "name_de" | "min_age" | "max_age">,
): string {
  const name = localizedName(branch);
  if (branch.max_age >= NO_MAX_AGE)
    return i18n.t("format.ageFrom", { name, min: branch.min_age });
  return i18n.t("format.ageRange", {
    name,
    min: branch.min_age,
    max: branch.max_age,
  });
}

export function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(LOCALES[currentLanguage()], {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type ErrorKey = keyof Translation["errors"];

// Contraintes de la base (CHECK, UNIQUE, clés étrangères) : leur nom
// apparaît dans le message Postgres
const CONSTRAINT_KEYS: ErrorKey[] = [
  "activities_participants_range_check",
  "activities_participants_positive_check",
  "activities_duration_positive_check",
  "age_branches_age_range_check",
  "characteristic_forms_position_check",
  "activity_types_name_key",
  "age_branches_name_key",
  "characteristic_forms_name_key",
  "characteristic_forms_position_key",
  "activity_characteristic_forms_characteristic_form_id_fkey",
];

// Messages levés par nos fonctions SQL (raise exception), en français
const SERVER_MESSAGES: Record<string, ErrorKey> = {
  "Au moins une forme caractéristique est obligatoire": "formRequired",
  "Activité introuvable ou non modifiable": "activityNotEditable",
  "Réservé aux administrateurs": "adminOnly",
  "Tu ne peux pas changer ton propre rôle": "ownRole",
  "Utilisateur introuvable": "userNotFound",
  "Type introuvable": "typeNotFound",
  "Le type « Inconnu » ne peut pas être supprimé": "fallbackType",
};

// Les erreurs Supabase ne sont pas des Error natives. Un refus connu est
// traduit ; un autre message est affiché tel quel ; sinon le fallback.
export function errorMessage(e: unknown, fallback: string): string {
  if (e && typeof e === "object" && "message" in e) {
    const message = (e as { message: unknown }).message;
    if (typeof message === "string" && message) {
      const key =
        SERVER_MESSAGES[message] ??
        CONSTRAINT_KEYS.find((name) => message.includes(name));
      return key ? i18n.t(`errors.${key}`) : message;
    }
  }
  return fallback;
}
