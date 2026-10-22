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
        <h1 className="text-2xl font-bold mb-6">{t("profile.title")}</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-sm space-y-4"
        >
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
              required
            />
          </div>

          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-gray-500">{t("common.email")}</dt>
              <dd>{user?.email}</dd>
            </div>
            <div>
              <dt className="text-gray-500">{t("profile.role")}</dt>
              <dd>{role && ROLES.includes(role) ? t(`roles.${role}`) : "—"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">{t("profile.memberSince")}</dt>
              <dd>{formatDate(profile?.created_at ?? null) ?? "—"}</dd>
            </div>
          </dl>

          {message && (
            <p
              className={`text-sm ${
                message.type === "success" ? "text-green-700" : "text-red-600"
              }`}
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? t("common.saving") : t("common.save")}
          </button>
        </form>
      </section>
    </MainLayout>
  );
}
