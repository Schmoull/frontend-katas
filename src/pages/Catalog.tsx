import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import ActivityCard from "../components/ActivityCard";
import { useReferenceData } from "../hooks/useReferenceData";
import { listPublishedActivities } from "../services/activitiesService";
import {
  LOCATION_LABELS,
  LOCATION_TYPES,
  type Activity,
  type LocationType,
} from "../types";

const selectClass = "w-full border border-gray-300 rounded-md p-2 bg-white";

export default function Catalog() {
  const { activityTypes, ageBranches, characteristicForms } =
    useReferenceData();

  const [search, setSearch] = useState("");
  const [activityTypeId, setActivityTypeId] = useState("");
  const [ageBranchId, setAgeBranchId] = useState("");
  const [characteristicFormId, setCharacteristicFormId] = useState("");
  const [locationType, setLocationType] = useState("");

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Petit délai pour ne pas requêter à chaque frappe
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listPublishedActivities({
          search: search.trim() || undefined,
          activityTypeId: activityTypeId || undefined,
          ageBranchId: ageBranchId || undefined,
          characteristicFormId: characteristicFormId || undefined,
          locationType: (locationType as LocationType) || undefined,
        });
        if (!cancelled) setActivities(data);
      } catch (e) {
        console.error("Erreur chargement du catalogue :", e);
        if (!cancelled) setError("Impossible de charger les activités.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, activityTypeId, ageBranchId, characteristicFormId, locationType]);

  return (
    <MainLayout>
      <section>
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Catalogue d'activités
          </h1>
          <p className="text-gray-600">
            Les activités publiées par les animateurs et animatrices.
          </p>
        </header>

        <div className="mb-6 grid gap-3 bg-white p-4 rounded-xl shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="search"
            placeholder="Rechercher par titre…"
            aria-label="Rechercher par titre"
            className="w-full border border-gray-300 rounded-md p-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            aria-label="Type d'activité"
            className={selectClass}
            value={activityTypeId}
            onChange={(e) => setActivityTypeId(e.target.value)}
          >
            <option value="">Tous les types</option>
            {activityTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Tranche d'âge"
            className={selectClass}
            value={ageBranchId}
            onChange={(e) => setAgeBranchId(e.target.value)}
          >
            <option value="">Toutes les tranches d'âge</option>
            {ageBranches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Lieu"
            className={selectClass}
            value={locationType}
            onChange={(e) => setLocationType(e.target.value)}
          >
            <option value="">Tous les lieux</option>
            {LOCATION_TYPES.map((value) => (
              <option key={value} value={value}>
                {LOCATION_LABELS[value]}
              </option>
            ))}
          </select>

          {/* Pleine largeur : les intitulés des formes sont longs */}
          <select
            aria-label="Forme caractéristique"
            className={`${selectClass} sm:col-span-2 lg:col-span-4`}
            value={characteristicFormId}
            onChange={(e) => setCharacteristicFormId(e.target.value)}
          >
            <option value="">Toutes les formes caractéristiques</option>
            {characteristicForms.map((form) => (
              <option key={form.id} value={form.id}>
                {form.position}. {form.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-gray-600">Chargement…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : activities.length === 0 ? (
          <p className="text-gray-600">Aucune activité ne correspond.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  );
}
