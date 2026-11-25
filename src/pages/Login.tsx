// src/pages/Login.tsx
import { useState } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/useAuth";
import AuthLayout from "../layouts/AuthLayout";
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
    <AuthLayout title={t("login.title")}>
      {errorMsg && (
        <p role="alert" className="corps-fort mb-4 text-danger">
          {errorMsg}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="libelle" htmlFor="email">
            {t("common.email")}
          </label>
          <input
            id="email"
            type="email"
            className="champ"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label className="libelle" htmlFor="password">
            {t("common.password")}
          </label>
          <input
            id="password"
            type="password"
            className="champ"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <Link
            to="/mot-de-passe-oublie"
            className="lien petit mt-2 inline-block"
          >
            {t("login.forgot")}
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-principal w-full"
        >
          {loading ? t("login.submitting") : t("login.submit")}
        </button>
      </form>

      <p className="petit mt-6 text-encre-douce">
        {t("login.noAccount")}{" "}
        <Link to="/register" className="lien">
          {t("login.createAccount")}
        </Link>
      </p>
      <p className="petit mt-2 text-encre-douce">
        <Link to="/" className="lien">
          {t("login.browse")}
        </Link>
      </p>
    </AuthLayout>
  );
}
