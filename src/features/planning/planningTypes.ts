// src/features/planning/planningTypes.ts

export type Camp = {
  id: number;
  name: string;
  start_date: string; // "YYYY-MM-DD"
  end_date: string;   // "YYYY-MM-DD"
};

export type Activity = {
  id: number;
  name: string;
  relation_activity: string | null; // À son corps, À l’environnement…
  category: string | null;          // SC, AC, AA…
  start_time: string;               // ISO
  end_time: string;                 // ISO
  location: string | null;
  index_in_day: number | null;
};

export type Day = {
  key: string;   // "YYYY-MM-DD"
  label: string; // "lun. 3 juillet"
};

/**
 * État du drag vertical dans Picasso
 */
export type DragState = {
  activityId: number;
  dayKey: string;
  startClientY: number;
  initialStartMinutes: number; // minutes depuis DAY_START_HOUR
  durationMinutes: number;
};
