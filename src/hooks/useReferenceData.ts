// src/hooks/useReferenceData.ts
import { useEffect, useState } from "react";
import {
  listActivityTypes,
  listAgeBranches,
} from "../services/referenceService";
import type { ActivityType, AgeBranch } from "../types";

// Types d'activité et tranches d'âge, pour les filtres et le formulaire
export function useReferenceData() {
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [ageBranches, setAgeBranches] = useState<AgeBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([listActivityTypes(), listAgeBranches()])
      .then(([types, branches]) => {
        if (cancelled) return;
        setActivityTypes(types);
        setAgeBranches(branches);
      })
      .catch((e) => {
        console.error("Erreur chargement des données de référence :", e);
        if (!cancelled)
          setError("Impossible de charger les types et tranches d'âge.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { activityTypes, ageBranches, loading, error };
}
