import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LogoutButton from "../components/LogoutButton";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useAuth } from "../contexts/useAuth";
import { ROLES, type Role } from "../types";

type MainLayoutProps = {
  children: ReactNode;
};

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `block px-3 py-2 rounded-md font-medium ${
    isActive ? "bg-indigo-600 text-white" : "hover:bg-indigo-100 text-gray-800"
  }`;
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { t } = useTranslation();
  const { user, profile, hasRole } = useAuth();

  const displayName = profile?.display_name ?? user?.email ?? "";
  const role = profile?.role as Role | undefined;
  const roleLabel = role && ROLES.includes(role) ? t(`roles.${role}`) : null;

  return (
    <div className="min-h-screen md:flex bg-gray-100 text-gray-900">
      {/* ----- Barre latérale ----- */}
      <aside className="md:w-64 bg-white border-b md:border-b-0 md:border-r shadow-sm p-6 flex flex-col justify-between gap-6">
        <div>
          {user ? (
            <div className="text-center mb-8">
              <div className="mx-auto size-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold">
                {getInitials(displayName)}
              </div>
              <p className="mt-2 font-semibold break-words">{displayName}</p>
              {roleLabel && (
                <p className="text-sm text-gray-500">{roleLabel}</p>
              )}
            </div>
          ) : (
            <p className="mb-8 text-center text-lg font-bold text-indigo-600">
              {t("app.name")}
            </p>
          )}

          <nav className="space-y-2">
            <NavLink to="/" end className={navLinkClass}>
              {t("nav.catalog")}
            </NavLink>

            {user && (
              <NavLink to="/favoris" className={navLinkClass}>
                {t("nav.favorites")}
              </NavLink>
            )}

            {hasRole("contributeur") && (
              <>
                <NavLink to="/mes-activites" className={navLinkClass}>
                  {t("nav.myActivities")}
                </NavLink>
                <NavLink to="/activites/nouvelle" className={navLinkClass}>
                  {t("nav.newActivity")}
                </NavLink>
              </>
            )}

            {hasRole("moderateur") && (
              <NavLink to="/archives" className={navLinkClass}>
                {t("nav.archives")}
              </NavLink>
            )}

            {hasRole("administrateur") && (
              <>
                <NavLink to="/admin/utilisateurs" className={navLinkClass}>
                  {t("nav.users")}
                </NavLink>
                <NavLink to="/admin/referentiel" className={navLinkClass}>
                  {t("nav.referenceData")}
                </NavLink>
              </>
            )}

            {user && (
              <NavLink to="/profil" className={navLinkClass}>
                {t("nav.profile")}
              </NavLink>
            )}
          </nav>
        </div>

        <div className="space-y-4">
          <LanguageSwitcher />
          {user ? (
            <LogoutButton />
          ) : (
            <Link
              to="/login"
              className="block text-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition font-semibold"
            >
              {t("nav.login")}
            </Link>
          )}
        </div>
      </aside>

      {/* ----- Zone de contenu principale ----- */}
      <section className="flex-1 p-4 md:p-8">{children}</section>
    </div>
  );
}
