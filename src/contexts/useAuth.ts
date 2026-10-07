// src/contexts/useAuth.ts
import { createContext, useContext } from "react";
import type { Session, User } from "@supabase/supabase-js";
import type { Profile } from "../types";

export type AuthContextValue = {
  user: User | null;
  session: Session | null;
  // Ligne de public.profiles (créée par le trigger à l'inscription)
  profile: Profile | null;
  isModerator: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
