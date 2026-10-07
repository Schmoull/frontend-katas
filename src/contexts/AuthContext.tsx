// src/contexts/AuthContext.tsx
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { getProfile } from "../services/profileService";
import type { Session } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import type { Profile } from "../types";
import { AuthContext } from "./useAuth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const user = session?.user ?? null;
  const userId = user?.id ?? null;

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        console.error("Erreur getSession Supabase :", error);
      }
      setSession(data.session);
      if (!data.session) setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadProfile = useCallback(async (id: string) => {
    try {
      setProfile(await getProfile(id));
    } catch (e) {
      console.error("Erreur chargement profil :", e);
      setProfile(null);
    }
  }, []);

  // Le profil suit l'utilisateur connecté
  useEffect(() => {
    if (!userId) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    loadProfile(userId).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [userId, loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (userId) await loadProfile(userId);
  }, [userId, loadProfile]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Erreur déconnexion :", error);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isModerator: profile?.role === "moderateur",
        loading,
        refreshProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
