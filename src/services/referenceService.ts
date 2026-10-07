// src/services/referenceService.ts
// Données de référence : lecture pour tous, écriture réservée aux
// administrateurs (RLS, migration reference_data_admin).
import { supabase } from "../lib/supabaseClient";
import type { TablesInsert, TablesUpdate } from "../types/database";
import type { ActivityType, AgeBranch, CharacteristicForm } from "../types";

// ----- Lecture -----

export async function listActivityTypes(): Promise<ActivityType[]> {
  const { data, error } = await supabase
    .from("activity_types")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
}

export async function listCharacteristicForms(): Promise<CharacteristicForm[]> {
  const { data, error } = await supabase
    .from("characteristic_forms")
    .select("*")
    .order("position");
  if (error) throw error;
  return data;
}

export async function listAgeBranches(): Promise<AgeBranch[]> {
  const { data, error } = await supabase
    .from("age_branches")
    .select("*")
    .order("min_age");
  if (error) throw error;
  return data;
}

// ----- Nombre d'activités qui utilisent un élément (avant suppression) -----

async function countRows(
  table:
    "activities" | "activity_age_branches" | "activity_characteristic_forms",
  column: string,
  id: string,
): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq(column, id);
  if (error) throw error;
  return count ?? 0;
}

export const countActivitiesOfType = (id: string) =>
  countRows("activities", "activity_type_id", id);
export const countActivitiesOfAgeBranch = (id: string) =>
  countRows("activity_age_branches", "age_branch_id", id);
export const countActivitiesOfForm = (id: string) =>
  countRows("activity_characteristic_forms", "characteristic_form_id", id);

// ----- Types d'activité -----

export async function createActivityType(
  values: TablesInsert<"activity_types">,
): Promise<void> {
  const { error } = await supabase.from("activity_types").insert(values);
  if (error) throw error;
}

export async function updateActivityType(
  id: string,
  values: TablesUpdate<"activity_types">,
): Promise<void> {
  const { error } = await supabase
    .from("activity_types")
    .update(values)
    .eq("id", id);
  if (error) throw error;
}

// Les activités de ce type passent sur « Inconnu » (fonction SQL)
export async function deleteActivityType(id: string): Promise<void> {
  const { error } = await supabase.rpc("delete_activity_type", { p_id: id });
  if (error) throw error;
}

// ----- Tranches d'âge -----

export async function createAgeBranch(
  values: TablesInsert<"age_branches">,
): Promise<void> {
  const { error } = await supabase.from("age_branches").insert(values);
  if (error) throw error;
}

export async function updateAgeBranch(
  id: string,
  values: TablesUpdate<"age_branches">,
): Promise<void> {
  const { error } = await supabase
    .from("age_branches")
    .update(values)
    .eq("id", id);
  if (error) throw error;
}

// Retire aussi la tranche des activités qui l'utilisent (ON DELETE CASCADE)
export async function deleteAgeBranch(id: string): Promise<void> {
  const { error } = await supabase.from("age_branches").delete().eq("id", id);
  if (error) throw error;
}

// ----- Formes caractéristiques -----

export async function createCharacteristicForm(
  values: TablesInsert<"characteristic_forms">,
): Promise<void> {
  const { error } = await supabase.from("characteristic_forms").insert(values);
  if (error) throw error;
}

export async function updateCharacteristicForm(
  id: string,
  values: TablesUpdate<"characteristic_forms">,
): Promise<void> {
  const { error } = await supabase
    .from("characteristic_forms")
    .update(values)
    .eq("id", id);
  if (error) throw error;
}

// Refusé par la base si une activité utilise encore la forme
export async function deleteCharacteristicForm(id: string): Promise<void> {
  const { error } = await supabase
    .from("characteristic_forms")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
