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

const selectClass = "champ";

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
        <header className="bandeau-relief mb-6">
          <div className="bandeau-relief-bloc">
            <h1 className="titre-1">{t("catalog.title")}</h1>
            <p className="corps text-encre-douce">{t("catalog.subtitle")}</p>
          </div>
        </header>

        {/* La recherche se fait à la frappe ; le bouton reste pour le geste */}
        <form
          role="search"
          className="recherche mb-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="search"
            placeholder={t("catalog.searchPlaceholder")}
            aria-label={t("catalog.searchLabel")}
            className="champ"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-principal">
            {t("catalog.searchButton")}
          </button>
        </form>

        <div className="zone-filtres mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
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
          <p className="corps text-encre-douce">{t("common.loading")}</p>
        ) : error ? (
          <p role="alert" className="corps-fort text-danger">
            {error}
          </p>
        ) : activities.length === 0 ? (
          <p className="corps text-encre-douce">{t("catalog.empty")}</p>
        ) : (
          <div className="grille-fiches">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  );
}
