// src/services/activitiesService.ts
import { supabase } from "../lib/supabaseClient";
import type {
  Activity,
  ActivityInput,
  ActivityStatus,
  LocationType,
} from "../types";

// Activité + type + tranches d'âge (via activity_age_branches) + auteur
const ACTIVITY_SELECT = `
  *,
  activity_type:activity_types(id, name),
  age_branches(id, name, min_age, max_age),
  author:profiles(id, display_name)
`;

export type CatalogFilters = {
  search?: string;
  activityTypeId?: string;
  ageBranchId?: string;
  locationType?: LocationType;
};

export async function listPublishedActivities(
  filters: CatalogFilters = {},
): Promise<Activity[]> {
  // Jointure !inner séparée pour filtrer par tranche d'âge sans tronquer
  // la liste age_branches affichée.
  const select = filters.ageBranchId
    ? `${ACTIVITY_SELECT}, branch_filter:activity_age_branches!inner(age_branch_id)`
    : ACTIVITY_SELECT;

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

  const { data, error } = await query.overrideTypes<
    Activity[],
    { merge: false }
  >();
  if (error) throw error;
  return data;
}

export async function listMyActivities(userId: string): Promise<Activity[]> {
  const { data, error } = await supabase
    .from("activities")
    .select(ACTIVITY_SELECT)
    .eq("created_by", userId)
    .order("updated_at", { ascending: false })
    .overrideTypes<Activity[], { merge: false }>();
  if (error) throw error;
  return data;
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
  return data;
}

// Crée (id absent) ou modifie une activité avec ses tranches d'âge, en une
// seule transaction côté base (fonction save_activity). Renvoie l'id.
export async function saveActivity(
  input: ActivityInput,
  id?: string,
): Promise<string> {
  const { age_branch_ids, ...activity } = input;
  const { data, error } = await supabase.rpc("save_activity", {
    p_activity: activity,
    p_age_branch_ids: age_branch_ids,
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
