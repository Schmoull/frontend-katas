import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  addFavorite,
  isFavorite,
  removeFavorite,
} from "../services/favoritesService";
import { errorMessage } from "../lib/format";

// À n'afficher que pour un utilisateur connecté
export default function FavoriteButton({ activityId }: { activityId: string }) {
  const { t } = useTranslation();
  const [favorite, setFavorite] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    isFavorite(activityId)
      .then((value) => {
        if (!cancelled) setFavorite(value);
      })
      .catch((e) => console.error("Erreur chargement favori :", e));
    return () => {
      cancelled = true;
    };
  }, [activityId]);

  async function toggle() {
    setBusy(true);
    try {
      if (favorite) {
        await removeFavorite(activityId);
        setFavorite(false);
      } else {
        await addFavorite(activityId);
        setFavorite(true);
      }
    } catch (e) {
      alert(errorMessage(e, t("favorite.error")));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy || favorite === null}
      aria-pressed={favorite ?? false}
      className="btn btn-contour btn-favori"
    >
      <svg
        viewBox="0 0 24 24"
        fill={favorite ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z" />
      </svg>
      {favorite ? t("favorite.remove") : t("favorite.add")}
    </button>
  );
}
