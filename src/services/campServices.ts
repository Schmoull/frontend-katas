// src/services/campService.ts
import { supabase } from '../lib/supabaseClient'; 

// Assurez-vous que le type Camp est défini pour correspondre à public.camp_data
type Camp = {
    id: number; // ou bigint si vous utilisez le type number en TS pour le bigint
    owner_id: string;
    invite_code: string;
    name: string;
    start_date: string;
    end_date: string;
    groupe: string;
    unite:  string;
    responsable: string;
    location: string;
    theme: string;
    description: string;
    objectifs: string;
    fil_rouge: string;
};

type Activity = { 
    id: number;
    name: string;
    category: string | null; // Type AC, SdC, AA
    relation_activity: string | null; // à son corps, à soi, etc...
    start_time: string;  // timestamp renvoyé par Supabase
    end_time: string;
    responsable: string | null;
    location: string | null;
    description: string | null;
    materials: string | null;
    index_in_day: number | null;
};

/**
 * Récupère les détails d'un camp spécifique en utilisant la fonction RPC sécurisée.
 * Ceci contourne la RLS bloquante sur la table 'camps'.
 */
export async function getCampDetails(campId: number): Promise<Camp | null> {
    const { data, error } = await supabase.rpc("get_camp_details", {
        p_camp_id: campId,
    }).single();

    if (error) {
        console.error("Erreur RPC dans getCampDetails:", error);
        return null;
    }

    return data as Camp | null;
}

export async function getCampActivities(campId: number): Promise<Activity[]> { // 🛑 Changez le type de retour à Activity[]
    if (!campId) return [];

    const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('camp_id', campId) 
        .order('start_time', { ascending: true }); 

    if (error) {
        console.error("Erreur récupération activités (via SELECT):", error);
        // Si erreur Supabase, on retourne un tableau vide pour ne pas faire planter l'UI
        return []; 
    }
    
    // data sera [] si RLS bloque ou s'il n'y a pas d'activité.
    // data sera Activity[] si tout va bien.
    return (data as Activity[]) || []; 
}