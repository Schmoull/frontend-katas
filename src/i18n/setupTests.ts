// Tests : i18next en français, sans détection (pas de navigateur)
import i18n from "i18next";
import { fr } from "./fr";
import { de } from "./de";
import { it } from "./it";

await i18n.init({
  resources: {
    fr: { translation: fr },
    de: { translation: de },
    it: { translation: it },
  },
  lng: "fr",
  fallbackLng: "fr",
  interpolation: { escapeValue: false },
});
