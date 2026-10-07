// src/services/activitiesService.ts
import { supabase } from "../lib/supabaseClient";
import type {
  Activity,
  ActivityInput,
  ActivityStatus,
  LocationType,
} from "../types";

// Activité + type + tranches d'âge + formes caractéristiques (via les tables
// de liaison) + auteur. La clé étrangère de l'auteur est nommée : favorites
// relie aussi activities à profiles, PostgREST refuse sinon (PGRST201).
export const ACTIVITY_SELECT = `
  *,
  activity_type:activity_types(id, name),
  age_branches(id, name, min_age, max_age),
  characteristic_forms(id, position, name),
  author:profiles!activities_created_by_fkey(id, display_name)
`;

// Ordre d'affichage des listes imbriquées (PostgREST ne garantit aucun ordre)
export function sortRelations(activity: Activity): Activity {
  return {
    ...activity,
    age_branches: [...activity.age_branches].sort(
      (a, b) => a.min_age - b.min_age,
    ),
    characteristic_forms: [...activity.characteristic_forms].sort(
      (a, b) => a.position - b.position,
    ),
  };
}

export type CatalogFilters = {
  search?: string;
  activityTypeId?: string;
  ageBranchId?: string;
  characteristicFormId?: string;
  locationType?: LocationType;
};

export async function listPublishedActivities(
  filters: CatalogFilters = {},
): Promise<Activity[]> {
  // Jointures !inner séparées pour filtrer sans tronquer les listes
  // age_branches / characteristic_forms affichées.
  let select = ACTIVITY_SELECT;
  if (filters.ageBranchId)
    select += ", branch_filter:activity_age_branches!inner(age_branch_id)";
  if (filters.characteristicFormId)
    select +=
      ", form_filter:activity_characteristic_forms!inner(characteristic_form_id)";

  let query = supabase
    .from("activities")
    .select(select)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (filters.search) query = query.ilike("title", `%${filters.search}%`);
  if (filters.activityTypeId)
    query = query.eq("activity_type_id", filters.activityTypeId);
  if (filters.locationType)
    query = query.eq("location_type", filters.locationType);
  if (filters.ageBranchId)
    query = query.eq("branch_filter.age_branch_id", filters.ageBranchId);
  if (filters.characteristicFormId)
    query = query.eq(
      "form_filter.characteristic_form_id",
      filters.characteristicFormId,
    );

  const { data, error } = await query.overrideTypes<
    Activity[],
    { merge: false }
  >();
  if (error) throw error;
  return data.map(sortRelations);
}

export async function listMyActivities(userId: string): Promise<Activity[]> {
  const { data, error } = await supabase
    .from("activities")
    .select(ACTIVITY_SELECT)
    .eq("created_by", userId)
    .order("updated_at", { ascending: false })
    .overrideTypes<Activity[], { merge: false }>();
  if (error) throw error;
  return data.map(sortRelations);
}

// Activités archivées de tous les auteurs. La RLS ne les rend visibles
// qu'aux modérateurs et administrateurs (et à leur auteur).
export async function listArchivedActivities(): Promise<Activity[]> {
  const { data, error } = await supabase
    .from("activities")
    .select(ACTIVITY_SELECT)
    .eq("status", "archived")
    .order("updated_at", { ascending: false })
    .overrideTypes<Activity[], { merge: false }>();
  if (error) throw error;
  return data.map(sortRelations);
}

// Renvoie null si l'activité n'existe pas ou n'est pas visible (RLS)
export async function getActivity(id: string): Promise<Activity | null> {
  const { data, error } = await supabase
    .from("activities")
    .select(ACTIVITY_SELECT)
    .eq("id", id)
    .maybeSingle()
    .overrideTypes<Activity | null, { merge: false }>();
  if (error) throw error;
  return data && sortRelations(data);
}

// Crée (id absent) ou modifie une activité avec ses tranches d'âge et ses
// formes caractéristiques, en une seule transaction côté base (fonction
// save_activity). Renvoie l'id.
export async function saveActivity(
  input: ActivityInput,
  id?: string,
): Promise<string> {
  const { age_branch_ids, characteristic_form_ids, ...activity } = input;
  const { data, error } = await supabase.rpc("save_activity", {
    p_activity: activity,
    p_age_branch_ids: age_branch_ids,
    p_characteristic_form_ids: characteristic_form_ids,
    p_id: id,
  });
  if (error) throw error;
  return data;
}

export async function setActivityStatus(
  id: string,
  status: ActivityStatus,
): Promise<void> {
  const { error } = await supabase
    .from("activities")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteActivity(id: string): Promise<void> {
  const { error } = await supabase.from("activities").delete().eq("id", id);
  if (error) throw error;
}
