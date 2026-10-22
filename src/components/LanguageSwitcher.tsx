import { useTranslation } from "react-i18next";
import { UI_LANGUAGES, currentLanguage } from "../i18n/languages";

// Boutons FR / DE / IT ; le choix est mémorisé par le détecteur (localStorage)
export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const active = currentLanguage();

  return (
    <div
      role="group"
      aria-label={t("language.label")}
      className="flex justify-center gap-1"
    >
      {UI_LANGUAGES.map((lang) => (
        <button
          key={lang}
          type="button"
          lang={lang}
          aria-pressed={active === lang}
          onClick={() => i18n.changeLanguage(lang)}
          className={`px-3 py-1 rounded-md text-sm font-semibold uppercase ${
            active === lang
              ? "bg-indigo-600 text-white"
              : "text-gray-600 hover:bg-indigo-100"
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
