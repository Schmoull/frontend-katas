import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/useAuth";
import LanguageSwitcher from "../components/LanguageSwitcher";

// Erreur renvoyée par Supabase dans l'URL quand le lien est invalide ou expiré
// (ex. #error=access_denied&error_code=otp_expired&error_description=...)
function getLinkError(): string | null {
  const params = new URLSearchParams(window.location.hash.slice(1));
  return params.get("error_description");
}

export default function ResetPassword() {
  const { t } = useTranslation();
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
      setErrorMsg(t("reset.mismatch"));
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (error) {
      console.error("Erreur updateUser Supabase :", error);
      setErrorMsg(error.message || t("reset.error"));
      return;
    }

    navigate("/", { replace: true });
  }

  let content;
  if (authLoading) {
    content = <p className="text-gray-600">{t("reset.checking")}</p>;
  } else if (!user) {
    content = (
      <div className="space-y-4">
        <p className="text-red-600">{linkError ?? t("reset.invalid")}</p>
        <Link
          to="/mot-de-passe-oublie"
          className="text-indigo-600 hover:underline"
        >
          {t("reset.requestNew")}
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
              {t("reset.newPassword")}
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
              {t("reset.confirm")}
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
            {saving ? t("common.saving") : t("reset.submit")}
          </button>
        </form>
      </>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("reset.title")}
          </h1>
          <LanguageSwitcher />
        </div>
        {content}
      </div>
    </main>
  );
}
