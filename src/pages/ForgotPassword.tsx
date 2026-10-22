import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { supabase } from "../lib/supabaseClient";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function ForgotPassword() {
  const { t } = useTranslation();
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
      setErrorMsg(error.message || t("forgot.error"));
      return;
    }

    setSent(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("forgot.title")}
          </h1>
          <LanguageSwitcher />
        </div>

        {sent ? (
          // Même message que le compte existe ou non (ne pas révéler les emails inscrits)
          <p className="text-gray-600">
            <Trans
              i18nKey="forgot.sent"
              values={{ email }}
              components={{ strong: <strong /> }}
            />
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-600">{t("forgot.intro")}</p>

            {errorMsg && (
              <p className="mb-4 text-sm text-red-600">{errorMsg}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="email"
                >
                  {t("common.email")}
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
                {loading ? t("forgot.submitting") : t("forgot.submit")}
              </button>
            </form>
          </>
        )}

        <p className="mt-4 text-sm text-gray-600">
          <Link to="/login" className="text-indigo-600 hover:underline">
            {t("forgot.back")}
          </Link>
        </p>
      </div>
    </main>
  );
}
