import grandJeu from "../assets/scoutoria/pictogrammes/picto-grand-jeu.svg";
import jeu from "../assets/scoutoria/pictogrammes/picto-jeu.svg";
import veillee from "../assets/scoutoria/pictogrammes/picto-veillee.svg";
import techniqueScoute from "../assets/scoutoria/pictogrammes/picto-technique-scoute.svg";
import bricolage from "../assets/scoutoria/pictogrammes/picto-bricolage.svg";
import sport from "../assets/scoutoria/pictogrammes/picto-sport.svg";
import nature from "../assets/scoutoria/pictogrammes/picto-nature.svg";

/**
 * Apparence d'un type d'activité selon la charte Scoutoria : couleur d'aplat,
 * couleur du texte posé dessus et pictogramme. La couleur ne doit jamais être
 * affichée seule : toujours avec le pictogramme (s'il existe) et le libellé.
 */
export type ActivityTypeStyle = {
  /** Classes de fond et de texte, ex. "bg-type-sport text-blanc sur-sombre" */
  className: string;
  /** URL du pictogramme, ou null si la charte n'en prévoit pas encore */
  pictogram: string | null;
};

// Clé : nom français du type (colonne activity_types.name).
const STYLES: Record<string, ActivityTypeStyle> = {
  "Grand jeu": {
    className: "bg-type-grand-jeu text-encre",
    pictogram: grandJeu,
  },
  Jeu: { className: "bg-type-jeu text-blanc sur-sombre", pictogram: jeu },
  Veillée: {
    className: "bg-type-veillee text-papier sur-sombre",
    pictogram: veillee,
  },
  "Technique scoute": {
    className: "bg-type-technique-scoute text-blanc sur-sombre",
    pictogram: techniqueScoute,
  },
  // « Bricolage » dans la charte
  Créatif: { className: "bg-type-bricolage text-encre", pictogram: bricolage },
  Sport: { className: "bg-type-sport text-blanc sur-sombre", pictogram: sport },
  // « Nature » dans la charte
  "Découverte nature": {
    className: "bg-type-nature text-encre",
    pictogram: nature,
  },
};

// Types sans couleur dans la charte (Réflexion, Service…) : aplat neutre.
const FALLBACK: ActivityTypeStyle = {
  className: "bg-papier-fonce text-encre",
  pictogram: null,
};

export function activityTypeStyle(
  typeName: string | null | undefined,
): ActivityTypeStyle {
  return (typeName && STYLES[typeName]) || FALLBACK;
}
