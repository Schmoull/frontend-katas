import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MainLayout from "../layouts/MainLayout";
import ReferenceTable from "../components/ReferenceTable";
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
import { localizedName } from "../i18n/languages";
import type { ActivityType, AgeBranch, CharacteristicForm } from "../types";

// Champs de formulaire (chaînes) → valeurs pour la base. Une traduction
// vide est enregistrée NULL : l'app retombe alors sur le français.
const text = (v: string) => v.trim();
const optionalText = (v: string) => v.trim() || null;
const int = (v: string) => Number(v);

export default function AdminReferenceData() {
  const { t } = useTranslation();
  const [types, setTypes] = useState<ActivityType[]>([]);
  const [branches, setBranches] = useState<AgeBranch[]>([]);
  const [forms, setForms] = useState<CharacteristicForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const [typeRows, branchRows, formRows] = await Promise.all([
      listActivityTypes(),
      listAgeBranches(),
      listCharacteristicForms(),
    ]);
    setTypes(typeRows);
    setBranches(branchRows);
    setForms(formRows);
  }, []);

  useEffect(() => {
    reload()
      .catch((e) => {
        console.error("Erreur chargement des données de référence :", e);
        setError(t("adminReference.loadError"));
      })
      .finally(() => setLoading(false));
  }, [reload, t]);

  // ----- Types d'activité -----

  async function deleteType(type: ActivityType) {
    const count = await countActivitiesOfType(type.id);
    const name = localizedName(type);
    const message =
      count > 0
        ? t("adminReference.deleteTypeUsed", { name, count })
        : t("adminReference.deleteType", { name });
    if (!confirm(message)) return;
    await deleteActivityType(type.id);
    await reload();
  }

  // ----- Tranches d'âge -----

  async function deleteBranch(branch: AgeBranch) {
    const count = await countActivitiesOfAgeBranch(branch.id);
    const name = localizedName(branch);
    const message =
      count > 0
        ? t("adminReference.deleteBranchUsed", { name, count })
        : t("adminReference.deleteBranch", { name });
    if (!confirm(message)) return;
    await deleteAgeBranch(branch.id);
    await reload();
  }

  // ----- Formes caractéristiques -----

  async function deleteForm(form: CharacteristicForm) {
    const count = await countActivitiesOfForm(form.id);
    if (count > 0) {
      alert(t("adminReference.formUsed", { position: form.position, count }));
      return;
    }
    const message = t("adminReference.deleteForm", {
      position: form.position,
      name: localizedName(form),
    });
    if (!confirm(message)) return;
    await deleteCharacteristicForm(form.id);
    await reload();
  }

  return (
    <MainLayout>
      <section className="max-w-6xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("adminReference.title")}
          </h1>
          <p className="text-sm text-gray-600">
            {t("adminReference.subtitle")}
          </p>
        </header>

        {loading ? (
          <p className="text-gray-600">{t("common.loading")}</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <>
            <ReferenceTable
              title={t("adminReference.typesTitle")}
              help={t("adminReference.typesHelp")}
              items={types}
              fields={[
                {
                  key: "name",
                  label: t("adminReference.name"),
                  required: true,
                  className: "w-1/6",
                },
                {
                  key: "name_de",
                  label: t("adminReference.nameDe"),
                  className: "w-1/6",
                },
                {
                  key: "name_it",
                  label: t("adminReference.nameIt"),
                  className: "w-1/6",
                },
                { key: "description", label: t("adminReference.description") },
                {
                  key: "description_de",
                  label: t("adminReference.descriptionDe"),
                },
                {
                  key: "description_it",
                  label: t("adminReference.descriptionIt"),
                },
              ]}
              toValues={(type) => ({
                name: type.name,
                name_de: type.name_de ?? "",
                name_it: type.name_it ?? "",
                description: type.description ?? "",
                description_de: type.description_de ?? "",
                description_it: type.description_it ?? "",
              })}
              isLocked={(type) => type.is_fallback}
              onCreate={async (v) => {
                await createActivityType({
                  name: text(v.name),
                  name_de: optionalText(v.name_de),
                  name_it: optionalText(v.name_it),
                  description: optionalText(v.description),
                  description_de: optionalText(v.description_de),
                  description_it: optionalText(v.description_it),
                });
                await reload();
              }}
              onUpdate={async (id, v) => {
                await updateActivityType(id, {
                  name: text(v.name),
                  name_de: optionalText(v.name_de),
                  name_it: optionalText(v.name_it),
                  description: optionalText(v.description),
                  description_de: optionalText(v.description_de),
                  description_it: optionalText(v.description_it),
                });
                await reload();
              }}
              onDelete={deleteType}
            />

            <ReferenceTable
              title={t("adminReference.agesTitle")}
              help={t("adminReference.agesHelp")}
              items={branches}
              fields={[
                {
                  key: "name",
                  label: t("adminReference.name"),
                  required: true,
                },
                { key: "name_de", label: t("adminReference.nameDe") },
                { key: "name_it", label: t("adminReference.nameIt") },
                {
                  key: "min_age",
                  label: t("adminReference.minAge"),
                  type: "number",
                  required: true,
                  className: "w-28",
                },
                {
                  key: "max_age",
                  label: t("adminReference.maxAge"),
                  type: "number",
                  required: true,
                  className: "w-28",
                },
              ]}
              toValues={(branch) => ({
                name: branch.name,
                name_de: branch.name_de ?? "",
                name_it: branch.name_it ?? "",
                min_age: String(branch.min_age),
                max_age: String(branch.max_age),
              })}
              onCreate={async (v) => {
                await createAgeBranch({
                  name: text(v.name),
                  name_de: optionalText(v.name_de),
                  name_it: optionalText(v.name_it),
                  min_age: int(v.min_age),
                  max_age: int(v.max_age),
                });
                await reload();
              }}
              onUpdate={async (id, v) => {
                await updateAgeBranch(id, {
                  name: text(v.name),
                  name_de: optionalText(v.name_de),
                  name_it: optionalText(v.name_it),
                  min_age: int(v.min_age),
                  max_age: int(v.max_age),
                });
                await reload();
              }}
              onDelete={deleteBranch}
            />

            <ReferenceTable
              title={t("adminReference.formsTitle")}
              help={t("adminReference.formsHelp")}
              items={forms}
              fields={[
                {
                  key: "position",
                  label: t("adminReference.number"),
                  type: "number",
                  required: true,
                  className: "w-20",
                },
                {
                  key: "name",
                  label: t("adminReference.label"),
                  required: true,
                },
                { key: "name_de", label: t("adminReference.labelDe") },
                { key: "name_it", label: t("adminReference.labelIt") },
              ]}
              toValues={(form) => ({
                position: String(form.position),
                name: form.name,
                name_de: form.name_de ?? "",
                name_it: form.name_it ?? "",
              })}
              onCreate={async (v) => {
                await createCharacteristicForm({
                  position: int(v.position),
                  name: text(v.name),
                  name_de: optionalText(v.name_de),
                  name_it: optionalText(v.name_it),
                });
                await reload();
              }}
              onUpdate={async (id, v) => {
                await updateCharacteristicForm(id, {
                  position: int(v.position),
                  name: text(v.name),
                  name_de: optionalText(v.name_de),
                  name_it: optionalText(v.name_it),
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
