// src/i18n/languages.ts
import i18n from "i18next";

// Langues de l'interface (traduction complète des textes)
export const UI_LANGUAGES = ["fr", "de", "it"] as const;
export type UiLanguage = (typeof UI_LANGUAGES)[number];

// Langues dans lesquelles une activité peut être écrite (contrainte en base)
export const CONTENT_LANGUAGES = ["fr", "de", "it"] as const;
export type ContentLanguage = (typeof CONTENT_LANGUAGES)[number];

// Locale des dates et nombres pour chaque langue de l'interface
export const LOCALES: Record<UiLanguage, string> = {
  fr: "fr-CH",
  de: "de-CH",
  it: "it-CH",
};

function isUiLanguage(lang: string | undefined): lang is UiLanguage {
  return (UI_LANGUAGES as readonly (string | undefined)[]).includes(lang);
}

// Langue active de l'interface (« de-CH » détecté → « de »)
export function currentLanguage(): UiLanguage {
  const lang = i18n.resolvedLanguage;
  return isUiLanguage(lang) ? lang : "fr";
}

// Données de référence : le texte traduit s'il existe, sinon le français
type Translatable = {
  name: string;
  name_de?: string | null;
  name_it?: string | null;
};

export function localizedName(
  item: Translatable,
  lang: UiLanguage = currentLanguage(),
): string {
  const translated =
    lang === "de" ? item.name_de : lang === "it" ? item.name_it : null;
  return translated || item.name;
}

export function localizedDescription(
  item: {
    description: string | null;
    description_de?: string | null;
    description_it?: string | null;
  },
  lang: UiLanguage = currentLanguage(),
): string | null {
  const translated =
    lang === "de"
      ? item.description_de
      : lang === "it"
        ? item.description_it
        : null;
  return translated || item.description;
}
