import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MainLayout from "../layouts/MainLayout";
import ActivityCard from "../components/ActivityCard";
import { useReferenceData } from "../hooks/useReferenceData";
import { listPublishedActivities } from "../services/activitiesService";
import {
  CONTENT_LANGUAGES,
  currentLanguage,
  localizedName,
  type ContentLanguage,
} from "../i18n/languages";
import { LOCATION_TYPES, type Activity, type LocationType } from "../types";

const selectClass = "w-full border border-gray-300 rounded-md p-2 bg-white";

export default function Catalog() {
  const { t, i18n } = useTranslation();
  const { activityTypes, ageBranches, characteristicForms } =
    useReferenceData();

  const [search, setSearch] = useState("");
  const [activityTypeId, setActivityTypeId] = useState("");
  const [ageBranchId, setAgeBranchId] = useState("");
  const [characteristicFormId, setCharacteristicFormId] = useState("");
  const [locationType, setLocationType] = useState("");
  // Par défaut : les activités écrites dans la langue de l'interface
  const [language, setLanguage] = useState<ContentLanguage | "">(
    currentLanguage,
  );

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Changer la langue de l'interface change aussi le filtre de langue
  const uiLanguage = i18n.resolvedLanguage;
  useEffect(() => {
    setLanguage(currentLanguage());
  }, [uiLanguage]);

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
          language: language || undefined,
        });
        if (!cancelled) setActivities(data);
      } catch (e) {
        console.error("Erreur chargement du catalogue :", e);
        if (!cancelled) setError(t("catalog.loadError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    search,
    activityTypeId,
    ageBranchId,
    characteristicFormId,
    locationType,
    language,
    t,
  ]);

  return (
    <MainLayout>
      <section>
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("catalog.title")}
          </h1>
          <p className="text-gray-600">{t("catalog.subtitle")}</p>
        </header>

        <div className="mb-6 grid gap-3 bg-white p-4 rounded-xl shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="search"
            placeholder={t("catalog.searchPlaceholder")}
            aria-label={t("catalog.searchLabel")}
            className="w-full border border-gray-300 rounded-md p-2 lg:col-span-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            aria-label={t("language.contentLabel")}
            className={selectClass}
            value={language}
            onChange={(e) => setLanguage(e.target.value as ContentLanguage)}
          >
            <option value="">{t("language.all")}</option>
            {CONTENT_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {t(`language.${lang}`)}
              </option>
            ))}
          </select>

          <select
            aria-label={t("catalog.typeLabel")}
            className={selectClass}
            value={activityTypeId}
            onChange={(e) => setActivityTypeId(e.target.value)}
          >
            <option value="">{t("catalog.allTypes")}</option>
            {activityTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {localizedName(type)}
              </option>
            ))}
          </select>

          <select
            aria-label={t("catalog.ageLabel")}
            className={selectClass}
            value={ageBranchId}
            onChange={(e) => setAgeBranchId(e.target.value)}
          >
            <option value="">{t("catalog.allAges")}</option>
            {ageBranches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {localizedName(branch)}
              </option>
            ))}
          </select>

          <select
            aria-label={t("catalog.locationLabel")}
            className={selectClass}
            value={locationType}
            onChange={(e) => setLocationType(e.target.value)}
          >
            <option value="">{t("catalog.allLocations")}</option>
            {LOCATION_TYPES.map((value) => (
              <option key={value} value={value}>
                {t(`locations.${value}`)}
              </option>
            ))}
          </select>

          {/* Les intitulés des formes sont longs */}
          <select
            aria-label={t("catalog.formLabel")}
            className={`${selectClass} sm:col-span-2`}
            value={characteristicFormId}
            onChange={(e) => setCharacteristicFormId(e.target.value)}
          >
            <option value="">{t("catalog.allForms")}</option>
            {characteristicForms.map((form) => (
              <option key={form.id} value={form.id}>
                {form.position}. {localizedName(form)}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-gray-600">{t("common.loading")}</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : activities.length === 0 ? (
          <p className="text-gray-600">{t("catalog.empty")}</p>
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
