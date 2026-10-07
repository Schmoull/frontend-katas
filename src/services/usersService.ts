// src/services/usersService.ts
// Administration des comptes : les fonctions SQL refusent tout appel
// qui ne vient pas d'un administrateur.
import { supabase } from "../lib/supabaseClient";
import type { Role, UserAccount } from "../types";

export async function listUsers(): Promise<UserAccount[]> {
  const { data, error } = await supabase.rpc("list_users");
  if (error) throw error;
  return data;
}

export async function setUserRole(userId: string, role: Role): Promise<void> {
  const { error } = await supabase.rpc("set_user_role", {
    p_user_id: userId,
    p_role: role,
  });
  if (error) throw error;
}
