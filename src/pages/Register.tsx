import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/useAuth";
import LanguageSwitcher from "../components/LanguageSwitcher";
import type { FormEvent } from "react";

export default function Register() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Inscription sans confirmation email → session directe
  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // Lu par le trigger handle_new_user pour créer le profil
      options: { data: { display_name: displayName.trim() } },
    });

    setLoading(false);

    if (error) {
      console.error("Erreur register Supabase :", error);
      setErrorMsg(error.message || t("register.error"));
      return;
    }

    if (!data.session) {
      setConfirmationSent(true);
    }
  }

  if (confirmationSent) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("register.checkEmailTitle")}
          </h1>
          <p className="text-gray-600">
            <Trans
              i18nKey="register.checkEmailText"
              values={{ email }}
              components={{ strong: <strong /> }}
            />
          </p>
          <Link to="/login" className="text-indigo-600 hover:underline">
            {t("register.goToLogin")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("register.title")}
          </h1>
          <LanguageSwitcher />
        </div>

        {errorMsg && <p className="mb-4 text-sm text-red-600">{errorMsg}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="display_name"
            >
              {t("common.displayName")}
            </label>
            <input
              id="display_name"
              type="text"
              className="w-full border border-gray-300 rounded-md p-2"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="nickname"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
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

          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="password"
            >
              {t("common.password")}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? t("register.submitting") : t("register.submit")}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          {t("register.hasAccount")}{" "}
          <Link to="/login" className="text-indigo-600 hover:underline">
            {t("register.login")}
          </Link>
        </p>
      </div>
    </main>
  );
}
