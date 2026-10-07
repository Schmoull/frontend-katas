// src/types/index.ts
import type { Tables } from "./database";

export type Profile = Tables<"profiles">;
export type ActivityType = Tables<"activity_types">;
export type AgeBranch = Tables<"age_branches">;
// Formes caractéristiques J+S « Sport de camp/Trekking »
export type CharacteristicForm = Tables<"characteristic_forms">;
export type ActivityRow = Tables<"activities">;

// Valeurs autorisées par les contraintes CHECK de la base
export const ROLES = [
  "animateur",
  "responsable_unite",
  "contributeur",
  "moderateur",
] as const;
export type Role = (typeof ROLES)[number];

export const ACTIVITY_STATUSES = ["draft", "published", "archived"] as const;
export type ActivityStatus = (typeof ACTIVITY_STATUSES)[number];

export const LOCATION_TYPES = ["interieur", "exterieur", "les_deux"] as const;
export type LocationType = (typeof LOCATION_TYPES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  animateur: "Animateur·rice",
  responsable_unite: "Responsable d'unité",
  contributeur: "Contributeur·rice",
  moderateur: "Modérateur·rice",
};

export const STATUS_LABELS: Record<ActivityStatus, string> = {
  draft: "Brouillon",
  published: "Publiée",
  archived: "Archivée",
};

export const LOCATION_LABELS: Record<LocationType, string> = {
  interieur: "Intérieur",
  exterieur: "Extérieur",
  les_deux: "Intérieur ou extérieur",
};

// Activité avec ses relations, telle que renvoyée par activitiesService
export type Activity = ActivityRow & {
  activity_type: Pick<ActivityType, "id" | "name"> | null;
  age_branches: AgeBranch[];
  characteristic_forms: CharacteristicForm[];
  author: Pick<Profile, "id" | "display_name"> | null;
};

// Données saisies dans le formulaire de création / modification
export type ActivityInput = {
  title: string;
  activity_type_id: string;
  description: string | null;
  pedagogical_objective: string | null;
  duration_minutes: number | null;
  min_participants: number | null;
  max_participants: number | null;
  location_type: LocationType | null;
  material_needed: string | null;
  safety_notes: string | null;
  narrative_theme: string | null;
  theme_adaptation_notes: string | null;
  status: ActivityStatus;
  age_branch_ids: string[];
  characteristic_form_ids: string[];
};
