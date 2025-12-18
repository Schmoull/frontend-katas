// src/types/index.ts

// Type minimal pour l'utilisateur Supabase (AuthContext)
export interface User {
  id: string;
  email: string;
  // Ajoute d'autres champs si ton AuthContext les fournit (ex: user_metadata)
}

export interface Camp {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  owner_id: string | null;
  // Ajouter d'autres champs si tu en as besoin dans les paramètres (groupe, location, etc.)
}

// Interface enrichie pour l'affichage des membres
export interface CampMember {
  id: string; // ID de la ligne dans camp_members
  camp_id: number;
  user_id: string; // ID de l'utilisateur
  role: 'owner' | 'admin' | 'member'; // Utilisation des rôles définis ou futurs
  created_at: string;
  // Nous allons ajouter un champ pour le profil de l'utilisateur, même s'il est vide pour l'instant
  user_profile: {
    email: string; // Pour l'instant, on utilise l'email pour l'affichage
    display_name: string; // Gardé pour la future table profiles
  };
}

// Interface pour les activités (pour info si besoin de croiser)
export interface Activity {
  id: number;
  name: string;
  start_time: string; // ou Date selon ton usage
  end_time: string; // ou Date selon ton usage
  camp_id: number;
  // ... autres champs
}

export interface CampInvite {
  code: string;
}