import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/useAuth";
import AuthLayout from "../layouts/AuthLayout";

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
    content = <p className="corps text-encre-douce">{t("reset.checking")}</p>;
  } else if (!user) {
    content = (
      <div className="space-y-5">
        <p role="alert" className="corps-fort text-danger">
          {linkError ?? t("reset.invalid")}
        </p>
        <Link to="/mot-de-passe-oublie" className="lien">
          {t("reset.requestNew")}
        </Link>
      </div>
    );
  } else {
    content = (
      <>
        {errorMsg && (
          <p role="alert" className="corps-fort mb-4 text-danger">
            {errorMsg}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="libelle" htmlFor="password">
              {t("reset.newPassword")}
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

          <div>
            <label className="libelle" htmlFor="confirmation">
              {t("reset.confirm")}
            </label>
            <input
              id="confirmation"
              type="password"
              className="champ"
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
            className="btn btn-principal w-full"
          >
            {saving ? t("common.saving") : t("reset.submit")}
          </button>
        </form>
      </>
    );
  }

  return <AuthLayout title={t("reset.title")}>{content}</AuthLayout>;
}
