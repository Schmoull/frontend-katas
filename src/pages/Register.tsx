import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/useAuth";
import AuthLayout from "../layouts/AuthLayout";
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
      <AuthLayout title={t("register.checkEmailTitle")}>
        <p className="corps text-encre-douce">
          <Trans
            i18nKey="register.checkEmailText"
            values={{ email }}
            components={{ strong: <strong /> }}
          />
        </p>
        <p className="mt-6">
          <Link to="/login" className="lien">
            {t("register.goToLogin")}
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t("register.title")}>
      {errorMsg && (
        <p role="alert" className="corps-fort mb-4 text-danger">
          {errorMsg}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="libelle" htmlFor="display_name">
            {t("common.displayName")}
          </label>
          <input
            id="display_name"
            type="text"
            className="champ"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete="nickname"
            required
          />
        </div>

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
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-principal w-full"
        >
          {loading ? t("register.submitting") : t("register.submit")}
        </button>
      </form>

      <p className="petit mt-6 text-encre-douce">
        {t("register.hasAccount")}{" "}
        <Link to="/login" className="lien">
          {t("register.login")}
        </Link>
      </p>
    </AuthLayout>
  );
}
