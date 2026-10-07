// src/hooks/useReferenceData.ts
import { useEffect, useState } from "react";
import {
  listActivityTypes,
  listAgeBranches,
  listCharacteristicForms,
} from "../services/referenceService";
import type { ActivityType, AgeBranch, CharacteristicForm } from "../types";

// Types d'activité, tranches d'âge et formes caractéristiques, pour les
// filtres et le formulaire
export function useReferenceData() {
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [ageBranches, setAgeBranches] = useState<AgeBranch[]>([]);
  const [characteristicForms, setCharacteristicForms] = useState<
    CharacteristicForm[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      listActivityTypes(),
      listAgeBranches(),
      listCharacteristicForms(),
    ])
      .then(([types, branches, forms]) => {
        if (cancelled) return;
        setActivityTypes(types);
        setAgeBranches(branches);
        setCharacteristicForms(forms);
      })
      .catch((e) => {
        console.error("Erreur chargement des données de référence :", e);
        if (!cancelled)
          setError("Impossible de charger les données de référence.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { activityTypes, ageBranches, characteristicForms, loading, error };
}
