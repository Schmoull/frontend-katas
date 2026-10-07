import { useCallback, useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import ReferenceTable, {
  type ReferenceValues,
} from "../components/ReferenceTable";
import {
  countActivitiesOfAgeBranch,
  countActivitiesOfForm,
  countActivitiesOfType,
  createActivityType,
  createAgeBranch,
  createCharacteristicForm,
  deleteActivityType,
  deleteAgeBranch,
  deleteCharacteristicForm,
  listActivityTypes,
  listAgeBranches,
  listCharacteristicForms,
  updateActivityType,
  updateAgeBranch,
  updateCharacteristicForm,
} from "../services/referenceService";
import type { ActivityType, AgeBranch, CharacteristicForm } from "../types";

function plural(n: number, word: string) {
  return `${n} ${word}${n > 1 ? "s" : ""}`;
}

// Champs de formulaire (chaînes) → valeurs pour la base
const text = (v: string) => v.trim();
const optionalText = (v: string) => v.trim() || null;
const int = (v: string) => Number(v);

export default function AdminReferenceData() {
  const [types, setTypes] = useState<ActivityType[]>([]);
  const [branches, setBranches] = useState<AgeBranch[]>([]);
  const [forms, setForms] = useState<CharacteristicForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const [t, b, f] = await Promise.all([
      listActivityTypes(),
      listAgeBranches(),
      listCharacteristicForms(),
    ]);
    setTypes(t);
    setBranches(b);
    setForms(f);
  }, []);

  useEffect(() => {
    reload()
      .catch((e) => {
        console.error("Erreur chargement des données de référence :", e);
        setError("Impossible de charger les données de référence.");
      })
      .finally(() => setLoading(false));
  }, [reload]);

  // ----- Types d'activité -----

  async function deleteType(type: ActivityType) {
    const count = await countActivitiesOfType(type.id);
    const message =
      count > 0
        ? `Supprimer le type « ${type.name} » ? ${plural(count, "activité")} passeront au type « Inconnu ».`
        : `Supprimer le type « ${type.name} » ?`;
    if (!confirm(message)) return;
    await deleteActivityType(type.id);
    await reload();
  }

  // ----- Tranches d'âge -----

  async function deleteBranch(branch: AgeBranch) {
    const count = await countActivitiesOfAgeBranch(branch.id);
    const message =
      count > 0
        ? `Supprimer la tranche « ${branch.name} » ? Elle sera retirée de ${plural(count, "activité")}.`
        : `Supprimer la tranche « ${branch.name} » ?`;
    if (!confirm(message)) return;
    await deleteAgeBranch(branch.id);
    await reload();
  }

  // ----- Formes caractéristiques -----

  async function deleteForm(form: CharacteristicForm) {
    const count = await countActivitiesOfForm(form.id);
    if (count > 0) {
      alert(
        `La forme ${form.position} est utilisée par ${plural(count, "activité")} : retire-la d'abord de ces activités, ou renomme-la plutôt que de la supprimer.`,
      );
      return;
    }
    if (!confirm(`Supprimer la forme ${form.position} « ${form.name} » ?`))
      return;
    await deleteCharacteristicForm(form.id);
    await reload();
  }

  return (
    <MainLayout>
      <section className="max-w-5xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">
            Données de référence
          </h1>
          <p className="text-sm text-gray-600">
            Les listes proposées dans le formulaire d'activité et les filtres du
            catalogue.
          </p>
        </header>

        {loading ? (
          <p className="text-gray-600">Chargement…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <>
            <ReferenceTable
              title="Types d'activité"
              help="Supprimer un type fait passer ses activités au type « Inconnu »."
              items={types}
              fields={[
                {
                  key: "name",
                  label: "Nom",
                  required: true,
                  className: "w-1/3",
                },
                { key: "description", label: "Description" },
              ]}
              toValues={(t) => ({
                name: t.name,
                description: t.description ?? "",
              })}
              isLocked={(t) => t.is_fallback}
              onCreate={async (v: ReferenceValues) => {
                await createActivityType({
                  name: text(v.name),
                  description: optionalText(v.description),
                });
                await reload();
              }}
              onUpdate={async (id, v) => {
                await updateActivityType(id, {
                  name: text(v.name),
                  description: optionalText(v.description),
                });
                await reload();
              }}
              onDelete={deleteType}
            />

            <ReferenceTable
              title="Tranches d'âge"
              help="Mettre 99 comme âge maximum pour « pas de limite ». Supprimer une tranche la retire des activités."
              items={branches}
              fields={[
                { key: "name", label: "Nom", required: true },
                {
                  key: "min_age",
                  label: "Âge min.",
                  type: "number",
                  required: true,
                  className: "w-28",
                },
                {
                  key: "max_age",
                  label: "Âge max.",
                  type: "number",
                  required: true,
                  className: "w-28",
                },
              ]}
              toValues={(b) => ({
                name: b.name,
                min_age: String(b.min_age),
                max_age: String(b.max_age),
              })}
              onCreate={async (v) => {
                await createAgeBranch({
                  name: text(v.name),
                  min_age: int(v.min_age),
                  max_age: int(v.max_age),
                });
                await reload();
              }}
              onUpdate={async (id, v) => {
                await updateAgeBranch(id, {
                  name: text(v.name),
                  min_age: int(v.min_age),
                  max_age: int(v.max_age),
                });
                await reload();
              }}
              onDelete={deleteBranch}
            />

            <ReferenceTable
              title="Formes caractéristiques (J+S)"
              help="Une forme utilisée par des activités ne peut pas être supprimée."
              items={forms}
              fields={[
                {
                  key: "position",
                  label: "N°",
                  type: "number",
                  required: true,
                  className: "w-20",
                },
                { key: "name", label: "Intitulé", required: true },
              ]}
              toValues={(f) => ({ position: String(f.position), name: f.name })}
              onCreate={async (v) => {
                await createCharacteristicForm({
                  position: int(v.position),
                  name: text(v.name),
                });
                await reload();
              }}
              onUpdate={async (id, v) => {
                await updateCharacteristicForm(id, {
                  position: int(v.position),
                  name: text(v.name),
                });
                await reload();
              }}
              onDelete={deleteForm}
            />
          </>
        )}
      </section>
    </MainLayout>
  );
}
