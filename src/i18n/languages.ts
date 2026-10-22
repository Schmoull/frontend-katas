// src/i18n/languages.ts
import i18n from "i18next";

// Langues de l'interface (traduction complète des textes)
export const UI_LANGUAGES = ["fr", "de"] as const;
export type UiLanguage = (typeof UI_LANGUAGES)[number];

// Langues dans lesquelles une activité peut être écrite (contrainte en base)
export const CONTENT_LANGUAGES = ["fr", "de", "it"] as const;
export type ContentLanguage = (typeof CONTENT_LANGUAGES)[number];

// Locale des dates et nombres pour chaque langue de l'interface
export const LOCALES: Record<UiLanguage, string> = {
  fr: "fr-CH",
  de: "de-CH",
};

// Langue active de l'interface (« de-CH » détecté → « de »)
export function currentLanguage(): UiLanguage {
  return i18n.resolvedLanguage === "de" ? "de" : "fr";
}

// Données de référence : le texte allemand s'il existe, sinon le français
type Translatable = { name: string; name_de?: string | null };

export function localizedName(
  item: Translatable,
  lang: UiLanguage = currentLanguage(),
): string {
  return (lang === "de" && item.name_de) || item.name;
}

export function localizedDescription(
  item: { description: string | null; description_de?: string | null },
  lang: UiLanguage = currentLanguage(),
): string | null {
  return (lang === "de" && item.description_de) || item.description;
}
