// src/services/favoritesService.ts
// Favoris de l'utilisateur connecté (la RLS limite tout à ses propres lignes)
import { supabase } from "../lib/supabaseClient";
import { ACTIVITY_SELECT, sortRelations } from "./activitiesService";
import type { Activity } from "../types";

export async function isFavorite(activityId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from("favorites")
    .select("activity_id", { count: "exact", head: true })
    .eq("activity_id", activityId);
  if (error) throw error;
  return (count ?? 0) > 0;
}

// user_id est rempli par la base (défaut auth.uid())
export async function addFavorite(activityId: string): Promise<void> {
  const { error } = await supabase
    .from("favorites")
    .insert({ activity_id: activityId });
  if (error) throw error;
}

export async function removeFavorite(activityId: string): Promise<void> {
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("activity_id", activityId);
  if (error) throw error;
}

// Plus récents d'abord. Une activité devenue invisible (repassée en
// brouillon par son auteur…) revient à null et est ignorée.
export async function listFavoriteActivities(): Promise<Activity[]> {
  const { data, error } = await supabase
    .from("favorites")
    .select(`activity:activities(${ACTIVITY_SELECT})`)
    .order("created_at", { ascending: false })
    .overrideTypes<{ activity: Activity | null }[], { merge: false }>();
  if (error) throw error;
  return data
    .map((row) => row.activity)
    .filter((a): a is Activity => a !== null)
    .map(sortRelations);
}
