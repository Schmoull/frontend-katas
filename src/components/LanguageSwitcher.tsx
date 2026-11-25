import { useTranslation } from "react-i18next";
import { UI_LANGUAGES, currentLanguage } from "../i18n/languages";

// Boutons FR / DE / IT ; le choix est mémorisé par le détecteur (localStorage)
export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const active = currentLanguage();

  return (
    <div role="group" aria-label={t("language.label")} className="flex">
      {UI_LANGUAGES.map((lang) => (
        <button
          key={lang}
          type="button"
          lang={lang}
          aria-pressed={active === lang}
          onClick={() => i18n.changeLanguage(lang)}
          className={`h-9 min-w-9 px-2 font-titre text-base font-bold uppercase tracking-wider ${
            active === lang
              ? "bg-encre text-papier"
              : "text-encre-douce hover:bg-papier-fonce hover:text-encre"
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
