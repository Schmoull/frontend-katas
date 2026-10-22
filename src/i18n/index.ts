// src/i18n/index.ts
// Initialise i18next une fois, au démarrage (importé par main.tsx).
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { fr } from "./fr";
import { de } from "./de";
import { UI_LANGUAGES } from "./languages";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { fr: { translation: fr }, de: { translation: de } },
    supportedLngs: [...UI_LANGUAGES],
    // « de-CH », « fr-CH »… → « de », « fr »
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    fallbackLng: "fr",
    // Choix mémorisé, sinon langue du navigateur
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "lang",
      caches: ["localStorage"],
    },
    // React échappe déjà le texte
    interpolation: { escapeValue: false },
  });

// Langue et titre de la page suivent la langue choisie
function syncDocument() {
  document.documentElement.lang = i18n.resolvedLanguage ?? "fr";
  document.title = i18n.t("app.name");
}
syncDocument();
i18n.on("languageChanged", syncDocument);

export default i18n;
