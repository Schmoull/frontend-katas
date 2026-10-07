// src/lib/format.ts
import type { AgeBranch } from "../types";

export function formatDuration(minutes: number | null): string | null {
  if (minutes == null) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
}

export function formatParticipants(
  min: number | null,
  max: number | null,
): string | null {
  if (min != null && max != null)
    return min === max ? `${min} participants` : `${min} à ${max} participants`;
  if (min != null) return `${min} participants min.`;
  if (max != null) return `${max} participants max.`;
  return null;
}

// max_age = 99 signifie « pas de limite d'âge » (ex. Routiers)
const NO_MAX_AGE = 99;

export function formatAgeBranch(branch: AgeBranch): string {
  if (branch.max_age >= NO_MAX_AGE)
    return `${branch.name} (dès ${branch.min_age} ans)`;
  return `${branch.name} (${branch.min_age}–${branch.max_age} ans)`;
}

export function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("fr-CH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Contraintes de la base (CHECK, UNIQUE, clés étrangères) → message lisible
const CONSTRAINT_MESSAGES: Record<string, string> = {
  activities_participants_range_check:
    "Le nombre minimum de participants dépasse le nombre maximum.",
  activities_participants_positive_check:
    "Le nombre de participants doit être d'au moins 1.",
  activities_duration_positive_check:
    "La durée doit être supérieure à 0 minute.",
  age_branches_age_range_check:
    "L'âge minimum doit être positif et ne pas dépasser l'âge maximum.",
  characteristic_forms_position_check: "Le numéro doit être d'au moins 1.",
  activity_types_name_key: "Un type porte déjà ce nom.",
  age_branches_name_key: "Une tranche d'âge porte déjà ce nom.",
  characteristic_forms_name_key: "Une forme caractéristique porte déjà ce nom.",
  characteristic_forms_position_key:
    "Une forme caractéristique porte déjà ce numéro.",
  activity_characteristic_forms_characteristic_form_id_fkey:
    "Cette forme est utilisée par des activités : impossible de la supprimer.",
};

// Les messages d'erreur Supabase ne sont pas des Error natives
export function errorMessage(e: unknown, fallback: string): string {
  if (e && typeof e === "object" && "message" in e) {
    const message = (e as { message: unknown }).message;
    if (typeof message === "string" && message) {
      const constraint = Object.keys(CONSTRAINT_MESSAGES).find((name) =>
        message.includes(name),
      );
      return constraint ? CONSTRAINT_MESSAGES[constraint] : message;
    }
  }
  return fallback;
}
