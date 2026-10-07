import { useEffect, useState } from "react";
import {
  addFavorite,
  isFavorite,
  removeFavorite,
} from "../services/favoritesService";
import { errorMessage } from "../lib/format";

// À n'afficher que pour un utilisateur connecté
export default function FavoriteButton({ activityId }: { activityId: string }) {
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
      alert(errorMessage(e, "Impossible de modifier les favoris."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy || favorite === null}
      aria-pressed={favorite ?? false}
      className={`px-3 py-2 rounded-md border disabled:opacity-50 ${
        favorite
          ? "border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-100"
          : "border-gray-300 bg-white hover:bg-gray-50"
      }`}
    >
      {favorite ? "★ Dans mes favoris" : "☆ Ajouter aux favoris"}
    </button>
  );
}
