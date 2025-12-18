// src/services/campMembersService.ts
import { supabase } from "../lib/supabaseClient";
import { type CampMember } from "../types"; // Importe les nouveaux types

/**
 * Récupère tous les membres d'un camp, en joignant l'information utilisateur (email)
 * NOTE : L'opération de jointure n'est pas possible directement sur auth.users via PostgREST/Supabase sans une vue ou une fonction PostgreSQL.
 * Pour l'instant, nous allons récupérer les membres et l'email de l'utilisateur sera à implémenter si tu crées la table profiles.
 * Vu que tu n'as pas de table profiles, je te propose une requête qui fonctionnerait SI tu l'avais, mais ici elle est simplifiée.
 * Pour l'affichage, nous devons nous contenter de l'ID ou créer un mécanisme d'enrichissement.
 *
 * Pour simplifier et rester fonctionnel avec ta DB actuelle (sans jointure de profil):
 * On va simuler l'enrichissement par l'email que seul un RLS sur `auth.users` pourrait donner,
 * mais comme c'est complexe, on va juste récupérer l'ID et le rôle pour le moment.
 */
export async function getCampMembers(campId: number): Promise<CampMember[]> {
    // Appel de la fonction RPC (Remote Procedure Call)
    const { data, error } = await supabase.rpc("get_camp_members_list", {
        p_camp_id: campId,
    });

    if (error) {
        // L'erreur ici inclura le message "Accès refusé" si l'utilisateur n'est pas membre
        console.error("Erreur RPC:", error);
        throw new Error(`Erreur de chargement des membres : ${error.message}`);
    }

    // Mappage des données RPC pour correspondre à notre interface CampMember
    const members: CampMember[] = (data as any[]).map(m => ({
        id: m.id,
        camp_id: m.camp_id,
        user_id: m.user_id,
        role: m.role as CampMember['role'],
        created_at: m.created_at,
        user_profile: {
        email: m.user_id, // Placeholder (ID)
        display_name: m.user_id, // Placeholder (ID)
        },
    }));

    return members;
}

/**
 * Change le rôle d'un membre spécifique dans le camp.
 */
export async function updateMemberRole(
  memberId: string,
  newRole: 'owner' | 'admin' | 'member'
) {
  const { error } = await supabase
    .from("camp_members")
    .update({ role: newRole })
    .eq("id", memberId);

  if (error) {
    throw new Error(`Erreur de mise à jour du rôle : ${error.message}`);
  }
}

/**
 * Supprime un membre du camp.
 */
export async function removeCampMember(memberId: string) {
  const { error } = await supabase
    .from("camp_members")
    .delete()
    .eq("id", memberId);

  if (error) {
    throw new Error(`Erreur de suppression du membre : ${error.message}`);
  }
}