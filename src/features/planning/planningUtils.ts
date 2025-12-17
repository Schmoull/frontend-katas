// src/features/planning/planningUtils.ts
import type { Day, Activity } from "./planningTypes";

/**
 * Valeurs par défaut si aucune activité ne sort du cadre
 */
const DEFAULT_DAY_START_HOUR = 8;  // 08h00
const DEFAULT_DAY_END_HOUR = 22;   // 22h00

export type PlanningConfig = {
  startMinutes: number;   // minutes depuis minuit (début grille)
  endMinutes: number;     // minutes depuis minuit (fin grille)
  slotMinutes: number;    // durée d’un slot
  slotHeight: number;     // hauteur d’un slot (px)
  totalMinutes: number;   // end - start
  totalSlots: number;     // totalMinutes / slotMinutes
  hours: number[];        // heures à afficher dans la colonne de gauche
};

/**
 * Construction de la config de planning à partir des activités.
 * - Étend la journée si nécessaire
 * - Sinon reste sur 08h–22h
 */
export function buildPlanningConfig(activities: Activity[]): PlanningConfig {
  const slotMinutes = 15;
  const slotHeight = 8;

  // 1) bornes par défaut (en minutes depuis minuit)
  let minMinutes = DEFAULT_DAY_START_HOUR * 60;
  let maxMinutes = DEFAULT_DAY_END_HOUR * 60;

  // 2) on étend en fonction des activités existantes
  for (const a of activities) {
    const s = new Date(a.start_time);
    const e = new Date(a.end_time);

    const sTotal = s.getHours() * 60 + s.getMinutes();
    const eTotal = e.getHours() * 60 + e.getMinutes();

    if (sTotal < minMinutes) minMinutes = sTotal;
    if (eTotal > maxMinutes) maxMinutes = eTotal;
  }

  // 3) on aligne les bornes sur des heures entières
  const startHour = Math.floor(minMinutes / 60);
  const endHour = Math.ceil(maxMinutes / 60);

  const startMinutes = startHour * 60;
  const endMinutes = endHour * 60;

  const totalMinutes = endMinutes - startMinutes;
  const totalSlots = totalMinutes / slotMinutes;

  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);

  return {
    startMinutes,
    endMinutes,
    slotMinutes,
    slotHeight,
    totalMinutes,
    totalSlots,
    hours,
  };
}

/**
 * Format d’un jour pour l’en-tête
 */
export function formatDayLabel(d: Date): string {
  return d.toLocaleDateString("fr-CH", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });
}

export function getDaysBetween(start: string, end: string): Day[] {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const days: Day[] = [];

  // On travaille en dates "locales"
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  const d = new Date(startDate);
  while (d <= endDate) {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");

    const key = `${year}-${month}-${day}`; // ex: "2025-11-28"

    days.push({ key, label: formatDayLabel(d) });
    d.setDate(d.getDate() + 1);
  }

  return days;
}

/**
 * Couleur du bloc selon la relation éducative
 */
export function colorForRelation(relation: string | null): string {
  switch (relation) {
    case "A la personnalité":
      return "#f1c40f";
    case "Au corps":
      return "#3498db";
    case "A l'environnement":
      return "#2ecc71";
    case "Aux autres":
      return "#e91e63";
    case "Au spirituel":
      return "#e74c3c";
    default:
      return "#7f8c8d";
  }
}

/**
 * Calcule la position visuelle d’une activité dans la colonne d’un jour,
 * en fonction de la config courante (startMinutes dynamique).
 */
export function computeActivityPlacement(
  startIso: string,
  endIso: string,
  config: PlanningConfig
): {
  startMinutes: number;      // minutes depuis le haut de la grille
  durationMinutes: number;
  top: number;
  height: number;
} {
  const start = new Date(startIso);
  const end = new Date(endIso);

  const startTotal = start.getHours() * 60 + start.getMinutes();
  const endTotal = end.getHours() * 60 + end.getMinutes();

  // minutes depuis le début de la grille
  let relStartMinutes = startTotal - config.startMinutes;
  if (relStartMinutes < 0) relStartMinutes = 0;
  if (relStartMinutes > config.totalMinutes) {
    relStartMinutes = config.totalMinutes;
  }

  let durationMinutes = Math.max(0, endTotal - startTotal);

  if (durationMinutes < config.slotMinutes) {
    durationMinutes = config.slotMinutes;
  }

  durationMinutes =
    Math.round(durationMinutes / config.slotMinutes) * config.slotMinutes;

  if (relStartMinutes + durationMinutes > config.totalMinutes) {
    durationMinutes = config.totalMinutes - relStartMinutes;
  }

  const top = (relStartMinutes / config.slotMinutes) * config.slotHeight;
  const height = (durationMinutes / config.slotMinutes) * config.slotHeight;

  return { startMinutes: relStartMinutes, durationMinutes, top, height };
}
