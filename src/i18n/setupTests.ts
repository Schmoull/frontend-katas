// Tests : i18next en français, sans détection (pas de navigateur)
import i18n from "i18next";
import { fr } from "./fr";
import { de } from "./de";

await i18n.init({
  resources: { fr: { translation: fr }, de: { translation: de } },
  lng: "fr",
  fallbackLng: "fr",
  interpolation: { escapeValue: false },
});
