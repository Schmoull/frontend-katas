// src/pages/Login.tsx
import { useState } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/useAuth";
import LanguageSwitcher from "../components/LanguageSwitcher";
import type { FormEvent } from "react";

export default function Login() {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Page demandée avant la redirection vers /login (cf. ProtectedRoute)
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  // Déjà connecté (ou connexion réussie) → redirection
  if (user) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      console.error("Erreur login Supabase :", error);
      setErrorMsg(error.message || t("login.error"));
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("login.title")}
          </h1>
          <LanguageSwitcher />
        </div>

        {errorMsg && <p className="mb-4 text-sm text-red-600">{errorMsg}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              autoComplete="current-password"
              required
            />
            <Link
              to="/mot-de-passe-oublie"
              className="mt-1 inline-block text-sm text-indigo-600 hover:underline"
            >
              {t("login.forgot")}
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? t("login.submitting") : t("login.submit")}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          {t("login.noAccount")}{" "}
          <Link to="/register" className="text-indigo-600 hover:underline">
            {t("login.createAccount")}
          </Link>
        </p>
        <p className="mt-2 text-sm text-gray-600">
          <Link to="/" className="text-indigo-600 hover:underline">
            {t("login.browse")}
          </Link>
        </p>
      </div>
    </main>
  );
}
