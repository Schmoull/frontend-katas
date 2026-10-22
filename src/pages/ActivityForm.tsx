import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MainLayout from "../layouts/MainLayout";
import { useAuth } from "../contexts/useAuth";
import { useReferenceData } from "../hooks/useReferenceData";
import { getActivity, saveActivity } from "../services/activitiesService";
import { errorMessage, formatAgeBranch } from "../lib/format";
import { activityPermissions } from "../lib/permissions";
import {
  CONTENT_LANGUAGES,
  currentLanguage,
  localizedName,
  type ContentLanguage,
} from "../i18n/languages";
import {
  LOCATION_TYPES,
  type Activity,
  type ActivityInput,
  type ActivityStatus,
  type LocationType,
} from "../types";

// Les champs numériques restent des chaînes tant qu'on est dans le formulaire
type FormValues = {
  title: string;
  activity_type_id: string;
  language: ContentLanguage;
  description: string;
  pedagogical_objective: string;
  duration_minutes: string;
  min_participants: string;
  max_participants: string;
  location_type: string;
  material_needed: string;
  safety_notes: string;
  narrative_theme: string;
  theme_adaptation_notes: string;
  age_branch_ids: string[];
  characteristic_form_ids: string[];
};

type IdListKey = "age_branch_ids" | "characteristic_form_ids";

// Une nouvelle activité est proposée dans la langue de l'interface
function emptyValues(): FormValues {
  return {
    title: "",
    activity_type_id: "",
    language: currentLanguage(),
    description: "",
    pedagogical_objective: "",
    duration_minutes: "",
    min_participants: "",
    max_participants: "",
    location_type: "",
    material_needed: "",
    safety_notes: "",
    narrative_theme: "",
    theme_adaptation_notes: "",
    age_branch_ids: [],
    characteristic_form_ids: [],
  };
}

function toFormValues(activity: Activity): FormValues {
  const str = (v: string | number | null) => (v == null ? "" : String(v));
  return {
    title: activity.title,
    activity_type_id: activity.activity_type_id,
    language: activity.language as ContentLanguage,
    description: str(activity.description),
    pedagogical_objective: str(activity.pedagogical_objective),
    duration_minutes: str(activity.duration_minutes),
    min_participants: str(activity.min_participants),
    max_participants: str(activity.max_participants),
    location_type: str(activity.location_type),
    material_needed: str(activity.material_needed),
    safety_notes: str(activity.safety_notes),
    narrative_theme: str(activity.narrative_theme),
    theme_adaptation_notes: str(activity.theme_adaptation_notes),
    age_branch_ids: activity.age_branches.map((b) => b.id),
    characteristic_form_ids: activity.characteristic_forms.map((f) => f.id),
  };
}

function toInput(values: FormValues, status: ActivityStatus): ActivityInput {
  const text = (v: string) => v.trim() || null;
  const int = (v: string) => (v === "" ? null : Number(v));
  return {
    title: values.title.trim(),
    activity_type_id: values.activity_type_id,
    language: values.language,
    description: text(values.description),
    pedagogical_objective: text(values.pedagogical_objective),
    duration_minutes: int(values.duration_minutes),
    min_participants: int(values.min_participants),
    max_participants: int(values.max_participants),
    location_type: (values.location_type as LocationType) || null,
    material_needed: text(values.material_needed),
    safety_notes: text(values.safety_notes),
    narrative_theme: text(values.narrative_theme),
    theme_adaptation_notes: text(values.theme_adaptation_notes),
    status,
    age_branch_ids: values.age_branch_ids,
    characteristic_form_ids: values.characteristic_form_ids,
  };
}

const inputClass = "w-full border border-gray-300 rounded-md p-2 bg-white";

function Field({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-1" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function ActivityForm() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const role = profile?.role;
  const userId = user?.id;
  const {
    activityTypes,
    ageBranches,
    characteristicForms,
    loading: refLoading,
  } = useReferenceData();

  const [values, setValues] = useState<FormValues>(emptyValues);
  const [currentStatus, setCurrentStatus] = useState<ActivityStatus>("draft");
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id || !userId) return;
    let cancelled = false;

    getActivity(id)
      .then((activity) => {
        if (cancelled) return;
        if (!activity) {
          setLoadError(t("common.activityNotFound"));
        } else if (!activityPermissions(activity, userId, role).canEdit) {
          setLoadError(t("form.cannotEdit"));
        } else {
          setValues(toFormValues(activity));
          setCurrentStatus(activity.status as ActivityStatus);
        }
      })
      .catch((e) => {
        console.error("Erreur chargement activité :", e);
        if (!cancelled) setLoadError(t("common.loadActivityError"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // t volontairement absent : changer de langue ne doit pas recharger
    // l'activité et écraser la saisie en cours
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, userId, role]);

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  // Coche / décoche un id dans une liste (tranches d'âge, formes)
  function toggleId(key: IdListKey, itemId: string) {
    setValues((v) => ({
      ...v,
      [key]: v[key].includes(itemId)
        ? v[key].filter((i) => i !== itemId)
        : [...v[key], itemId],
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setFormError(null);

    // Le bouton cliqué indique le statut voulu
    const submitter = (e.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    const status = (submitter?.value || currentStatus) as ActivityStatus;
    const input = toInput(values, status);

    if (input.characteristic_form_ids.length === 0) {
      setFormError(t("form.chooseForm"));
      return;
    }

    if (
      input.min_participants != null &&
      input.max_participants != null &&
      input.min_participants > input.max_participants
    ) {
      setFormError(t("errors.activities_participants_range_check"));
      return;
    }

    setSaving(true);
    try {
      const activityId = await saveActivity(input, id);
      navigate(`/activites/${activityId}`);
    } catch (e) {
      console.error("Erreur enregistrement activité :", e);
      setFormError(errorMessage(e, t("form.saveError")));
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <p className="text-gray-600">{t("common.loading")}</p>
      </MainLayout>
    );
  }

  if (loadError) {
    return (
      <MainLayout>
        <p className="text-red-600">{loadError}</p>
        <Link
          to="/"
          className="mt-4 inline-block text-indigo-600 hover:underline"
        >
          {t("common.backToCatalog")}
        </Link>
      </MainLayout>
    );
  }

  const noTypes = !refLoading && activityTypes.length === 0;
  // Le contenu saisi est dans la langue choisie pour l'activité
  const lang = values.language;

  return (
    <MainLayout>
      <section className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEdit ? t("form.titleEdit") : t("form.titleNew")}
        </h1>

        {noTypes && (
          <p className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
            {t("form.noTypes")}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-sm grid gap-4 md:grid-cols-2"
        >
          <Field
            label={t("form.title")}
            htmlFor="title"
            className="md:col-span-2"
          >
            <input
              id="title"
              type="text"
              lang={lang}
              className={inputClass}
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              required
            />
          </Field>

          <Field label={t("form.type")} htmlFor="activity_type_id">
            <select
              id="activity_type_id"
              className={inputClass}
              value={values.activity_type_id}
              onChange={(e) => set("activity_type_id", e.target.value)}
              required
            >
              <option value="">{t("form.choose")}</option>
              {activityTypes
                // « Inconnu » ne se choisit pas, sauf s'il est déjà attribué
                .filter(
                  (type) =>
                    !type.is_fallback || type.id === values.activity_type_id,
                )
                .map((type) => (
                  <option key={type.id} value={type.id}>
                    {localizedName(type)}
                  </option>
                ))}
            </select>
          </Field>

          <Field label={t("form.language")} htmlFor="language">
            <select
              id="language"
              className={inputClass}
              value={values.language}
              onChange={(e) =>
                set("language", e.target.value as ContentLanguage)
              }
              required
            >
              {CONTENT_LANGUAGES.map((option) => (
                <option key={option} value={option}>
                  {t(`language.${option}`)}
                </option>
              ))}
            </select>
          </Field>

          <fieldset className="md:col-span-2">
            <legend className="block text-sm font-medium mb-1">
              {t("form.forms")}
            </legend>
            <div className="space-y-2">
              {characteristicForms.map((form) => (
                <label key={form.id} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={values.characteristic_form_ids.includes(form.id)}
                    onChange={() =>
                      toggleId("characteristic_form_ids", form.id)
                    }
                  />
                  <span>
                    <span className="font-semibold">{form.position}.</span>{" "}
                    {localizedName(form)}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <Field label={t("form.location")} htmlFor="location_type">
            <select
              id="location_type"
              className={inputClass}
              value={values.location_type}
              onChange={(e) => set("location_type", e.target.value)}
            >
              <option value="">{t("form.unspecified")}</option>
              {LOCATION_TYPES.map((value) => (
                <option key={value} value={value}>
                  {t(`locations.${value}`)}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t("form.duration")} htmlFor="duration_minutes">
            <input
              id="duration_minutes"
              type="number"
              min={1}
              className={inputClass}
              value={values.duration_minutes}
              onChange={(e) => set("duration_minutes", e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4 md:col-span-2">
            <Field label={t("form.minParticipants")} htmlFor="min_participants">
              <input
                id="min_participants"
                type="number"
                min={1}
                className={inputClass}
                value={values.min_participants}
                onChange={(e) => set("min_participants", e.target.value)}
              />
            </Field>
            <Field label={t("form.maxParticipants")} htmlFor="max_participants">
              <input
                id="max_participants"
                type="number"
                min={1}
                className={inputClass}
                value={values.max_participants}
                onChange={(e) => set("max_participants", e.target.value)}
              />
            </Field>
          </div>

          <fieldset className="md:col-span-2">
            <legend className="block text-sm font-medium mb-1">
              {t("form.ageBranches")}
            </legend>
            {ageBranches.length === 0 ? (
              <p className="text-sm text-gray-500">{t("form.noAgeBranches")}</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {ageBranches.map((branch) => (
                  <label key={branch.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={values.age_branch_ids.includes(branch.id)}
                      onChange={() => toggleId("age_branch_ids", branch.id)}
                    />
                    {formatAgeBranch(branch)}
                  </label>
                ))}
              </div>
            )}
          </fieldset>

          <Field
            label={t("form.description")}
            htmlFor="description"
            className="md:col-span-2"
          >
            <textarea
              id="description"
              lang={lang}
              className={`${inputClass} min-h-[100px]`}
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </Field>

          <Field
            label={t("form.objective")}
            htmlFor="pedagogical_objective"
            className="md:col-span-2"
          >
            <textarea
              id="pedagogical_objective"
              lang={lang}
              className={`${inputClass} min-h-[80px]`}
              value={values.pedagogical_objective}
              onChange={(e) => set("pedagogical_objective", e.target.value)}
            />
          </Field>

          <Field
            label={t("form.material")}
            htmlFor="material_needed"
            className="md:col-span-2"
          >
            <textarea
              id="material_needed"
              lang={lang}
              className={`${inputClass} min-h-[60px]`}
              value={values.material_needed}
              onChange={(e) => set("material_needed", e.target.value)}
            />
          </Field>

          <Field
            label={t("form.safety")}
            htmlFor="safety_notes"
            className="md:col-span-2"
          >
            <textarea
              id="safety_notes"
              lang={lang}
              className={`${inputClass} min-h-[60px]`}
              value={values.safety_notes}
              onChange={(e) => set("safety_notes", e.target.value)}
            />
          </Field>

          <Field
            label={t("form.theme")}
            htmlFor="narrative_theme"
            className="md:col-span-2"
          >
            <textarea
              id="narrative_theme"
              lang={lang}
              className={`${inputClass} min-h-[60px]`}
              value={values.narrative_theme}
              onChange={(e) => set("narrative_theme", e.target.value)}
            />
          </Field>

          <Field
            label={t("form.themeAdaptation")}
            htmlFor="theme_adaptation_notes"
            className="md:col-span-2"
          >
            <textarea
              id="theme_adaptation_notes"
              lang={lang}
              className={`${inputClass} min-h-[60px]`}
              value={values.theme_adaptation_notes}
              onChange={(e) => set("theme_adaptation_notes", e.target.value)}
            />
          </Field>

          {formError && (
            <p className="md:col-span-2 text-sm text-red-600">{formError}</p>
          )}

          <div className="md:col-span-2 flex flex-wrap justify-end gap-2">
            <Link
              to={isEdit ? `/activites/${id}` : "/mes-activites"}
              className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
            >
              {t("common.cancel")}
            </Link>
            {isEdit ? (
              <button
                type="submit"
                value={currentStatus}
                disabled={saving || noTypes}
                className="px-4 py-2 rounded-md border border-indigo-600 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
              >
                {t("common.save")}
              </button>
            ) : (
              <button
                type="submit"
                value="draft"
                disabled={saving || noTypes}
                className="px-4 py-2 rounded-md border border-indigo-600 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
              >
                {t("form.saveDraft")}
              </button>
            )}
            {currentStatus !== "published" && (
              <button
                type="submit"
                value="published"
                disabled={saving || noTypes}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {isEdit ? t("form.saveAndPublish") : t("form.publish")}
              </button>
            )}
          </div>
        </form>
      </section>
    </MainLayout>
  );
}
