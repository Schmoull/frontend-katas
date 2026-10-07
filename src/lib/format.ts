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

// Les messages d'erreur Supabase ne sont pas des Error natives
export function errorMessage(e: unknown, fallback: string): string {
  if (e && typeof e === "object" && "message" in e) {
    const message = (e as { message: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}
