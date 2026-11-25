import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import MainLayout from "../layouts/MainLayout";
import { useAuth } from "../contexts/useAuth";
import { updateDisplayName } from "../services/profileService";
import { errorMessage, formatDate } from "../lib/format";
import { ROLES, type Role } from "../types";

export default function Profile() {
  const { t } = useTranslation();
  const { user, profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (profile) setDisplayName(profile.display_name);
  }, [profile]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    const name = displayName.trim();
    if (!name) return;

    setSaving(true);
    setMessage(null);
    try {
      await updateDisplayName(user.id, name);
      await refreshProfile();
      setMessage({ type: "success", text: t("profile.saved") });
    } catch (e) {
      setMessage({
        type: "error",
        text: errorMessage(e, t("profile.error")),
      });
    } finally {
      setSaving(false);
    }
  }

  const role = profile?.role as Role | undefined;

  return (
    <MainLayout>
      <section className="max-w-xl">
        <h1 className="titre-1 mb-6">{t("profile.title")}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              required
            />
          </div>

          <dl className="grid gap-4 bg-papier-fonce p-6 sm:grid-cols-2">
            <div>
              <dt className="surtitre text-encre-douce">{t("common.email")}</dt>
              <dd className="mt-1 font-semibold">{user?.email}</dd>
            </div>
            <div>
              <dt className="surtitre text-encre-douce">{t("profile.role")}</dt>
              <dd className="mt-1 font-semibold">
                {role && ROLES.includes(role) ? t(`roles.${role}`) : "—"}
              </dd>
            </div>
            <div>
              <dt className="surtitre text-encre-douce">
                {t("profile.memberSince")}
              </dt>
              <dd className="mt-1 font-semibold">
                {formatDate(profile?.created_at ?? null) ?? "—"}
              </dd>
            </div>
          </dl>

          {message && (
            <p
              role={message.type === "error" ? "alert" : "status"}
              className={`corps-fort ${
                message.type === "success" ? "text-sapin" : "text-danger"
              }`}
            >
              {message.text}
            </p>
          )}

          <button type="submit" disabled={saving} className="btn btn-principal">
            {saving ? t("common.saving") : t("common.save")}
          </button>
        </form>
      </section>
    </MainLayout>
  );
}
