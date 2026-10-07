import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    // Le lien de l'email ramène sur la page de choix du nouveau mot de passe.
    // Cette URL doit être autorisée dans Supabase (Auth → URL Configuration).
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nouveau-mot-de-passe`,
    });

    setLoading(false);

    if (error) {
      console.error("Erreur reset password Supabase :", error);
      setErrorMsg(error.message || "Envoi impossible.");
      return;
    }

    setSent(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          Mot de passe oublié
        </h1>

        {sent ? (
          // Même message que le compte existe ou non (ne pas révéler les emails inscrits)
          <p className="text-gray-600">
            Si un compte existe pour <strong>{email}</strong>, un lien pour
            choisir un nouveau mot de passe vient d'y être envoyé.
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-600">
              Indique ton email : tu recevras un lien pour choisir un nouveau
              mot de passe.
            </p>

            {errorMsg && (
              <p className="mb-4 text-sm text-red-600">{errorMsg}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "Envoi en cours..." : "Envoyer le lien"}
              </button>
            </form>
          </>
        )}

        <p className="mt-4 text-sm text-gray-600">
          <Link to="/login" className="text-indigo-600 hover:underline">
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </main>
  );
}
