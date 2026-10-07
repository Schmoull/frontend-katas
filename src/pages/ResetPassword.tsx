import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/useAuth";

// Erreur renvoyée par Supabase dans l'URL quand le lien est invalide ou expiré
// (ex. #error=access_denied&error_code=otp_expired&error_description=...)
function getLinkError(): string | null {
  const params = new URLSearchParams(window.location.hash.slice(1));
  return params.get("error_description");
}

export default function ResetPassword() {
  const navigate = useNavigate();
  // Le lien de l'email ouvre une session de récupération (détectée dans l'URL)
  const { user, loading: authLoading } = useAuth();
  const [linkError] = useState(getLinkError);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmation) {
      setErrorMsg("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (error) {
      console.error("Erreur updateUser Supabase :", error);
      setErrorMsg(error.message || "Impossible de changer le mot de passe.");
      return;
    }

    navigate("/", { replace: true });
  }

  let content;
  if (authLoading) {
    content = <p className="text-gray-600">Vérification du lien…</p>;
  } else if (!user) {
    content = (
      <div className="space-y-4">
        <p className="text-red-600">
          {linkError ?? "Ce lien est invalide ou a expiré."}
        </p>
        <Link
          to="/mot-de-passe-oublie"
          className="text-indigo-600 hover:underline"
        >
          Demander un nouveau lien
        </Link>
      </div>
    );
  } else {
    content = (
      <>
        {errorMsg && <p className="mb-4 text-sm text-red-600">{errorMsg}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="password"
            >
              Nouveau mot de passe
            </label>
            <input
              id="password"
              type="password"
              className="w-full border border-gray-300 rounded-md p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="confirmation"
            >
              Confirmer le mot de passe
            </label>
            <input
              id="confirmation"
              type="password"
              className="w-full border border-gray-300 rounded-md p-2"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Changer le mot de passe"}
          </button>
        </form>
      </>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          Nouveau mot de passe
        </h1>
        {content}
      </div>
    </main>
  );
}
