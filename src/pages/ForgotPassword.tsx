import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { supabase } from "../lib/supabaseClient";
import AuthLayout from "../layouts/AuthLayout";

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
    <AuthLayout title={t("forgot.title")}>
      {sent ? (
        // Même message que le compte existe ou non (ne pas révéler les emails inscrits)
        <p className="corps text-encre-douce">
          <Trans
            i18nKey="forgot.sent"
            values={{ email }}
            components={{ strong: <strong /> }}
          />
        </p>
      ) : (
        <>
          <p className="corps mb-4 text-encre-douce">{t("forgot.intro")}</p>

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

            <button
              type="submit"
              disabled={loading}
              className="btn btn-principal w-full"
            >
              {loading ? t("forgot.submitting") : t("forgot.submit")}
            </button>
          </form>
        </>
      )}

      <p className="petit mt-6 text-encre-douce">
        <Link to="/login" className="lien">
          {t("forgot.back")}
        </Link>
      </p>
    </AuthLayout>
  );
}
