// Typage des clés de traduction : t("cle.inconnue") ne compile pas.
import "i18next";
import type { Translation } from "./fr";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: { translation: Translation };
  }
}
