// src/services/referenceService.ts
// Données de référence, en lecture seule côté app (gérées depuis Supabase).
import { supabase } from "../lib/supabaseClient";
import type { ActivityType, AgeBranch, CharacteristicForm } from "../types";

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
