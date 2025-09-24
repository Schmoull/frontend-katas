import React from "react";

/**
 * Définition des "props" (paramètres du composant).
 * - title: titre affiché en gras
 * - description?: texte sous le titre (le "?" = paramètre optionnel)
 * - imageSrc?/imageAlt?: image en haut de la carte (optionnelle)
 * - actions?: zone libre pour mettre des boutons/liens (ex: <Button/>)
 */
type CardProps = {
  title: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  actions?: React.ReactNode; // Contenu React libre: texte, <button>, <a>, etc.
};

export default function Card({
  title,
  description,
  imageSrc,
  imageAlt,
  actions,
}: CardProps) {
  return (
    <article
      className="overflow-hidden rounded-xl border bg-white text-gray-900 shadow-sm transition hover:shadow-md"
    >
      {imageSrc && (
        <img
          src={imageSrc}
          alt={imageAlt ?? ""}
          loading="lazy"
          className="h-40 w-full object-cover"
        />
      )}

      <div className="p-4">
        <h3 className="text-lg font-semibold">{title}</h3>

        {description && (
          <p className="mt-1 text-sm text-gray-600">
            {description}
          </p>
        )}

        {actions && (
          <div className="mt-4 flex gap-2">
            {actions}
          </div>
        )}
      </div>
    </article>
  );
}
