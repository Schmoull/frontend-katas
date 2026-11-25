import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LogoutButton from "../components/LogoutButton";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useAuth } from "../contexts/useAuth";
import { ROLES, type Role } from "../types";
import logo from "../assets/scoutoria/scoutoria-logo.svg";

type MainLayoutProps = {
  children: ReactNode;
};

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
    <div className="min-h-screen bg-papier text-encre">
      <header className="entete">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 pt-4 md:px-8">
          <Link to="/" className="shrink-0">
            <img
              src={logo}
              alt={t("app.name")}
              className="h-10 w-auto md:h-12"
            />
          </Link>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {user ? (
              <>
                <Link
                  to="/profil"
                  className="flex items-center gap-2 no-underline"
                  title={t("nav.profile")}
                >
                  <span
                    aria-hidden="true"
                    className="flex size-9 items-center justify-center bg-encre font-titre text-base font-bold text-papier"
                  >
                    {getInitials(displayName)}
                  </span>
                  <span className="hidden flex-col leading-tight lg:flex">
                    <span className="corps-fort text-sm">{displayName}</span>
                    {roleLabel && (
                      <span className="legende text-encre-discrete">
                        {roleLabel}
                      </span>
                    )}
                  </span>
                  <span className="sr-only">{t("nav.profile")}</span>
                </Link>
                <LogoutButton />
              </>
            ) : (
              <Link to="/login" className="btn btn-secondaire btn-petit">
                {t("nav.login")}
              </Link>
            )}
          </div>

          {/* Défile horizontalement sur petit écran */}
          <nav className="-mx-4 w-full overflow-x-auto px-2 md:mx-0 md:px-0">
            <div className="flex gap-1 pb-1">
              <NavLink to="/" end className="nav-lien">
                {t("nav.catalog")}
              </NavLink>

              {user && (
                <NavLink to="/favoris" className="nav-lien">
                  {t("nav.favorites")}
                </NavLink>
              )}

              {hasRole("contributeur") && (
                <>
                  <NavLink to="/mes-activites" className="nav-lien">
                    {t("nav.myActivities")}
                  </NavLink>
                  <NavLink to="/activites/nouvelle" className="nav-lien">
                    {t("nav.newActivity")}
                  </NavLink>
                </>
              )}

              {hasRole("moderateur") && (
                <NavLink to="/archives" className="nav-lien">
                  {t("nav.archives")}
                </NavLink>
              )}

              {hasRole("administrateur") && (
                <>
                  <NavLink to="/admin/utilisateurs" className="nav-lien">
                    {t("nav.users")}
                  </NavLink>
                  <NavLink to="/admin/referentiel" className="nav-lien">
                    {t("nav.referenceData")}
                  </NavLink>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        {children}
      </main>
    </div>
  );
}
