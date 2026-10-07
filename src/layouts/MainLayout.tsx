import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import { useAuth } from "../contexts/useAuth";
import { ROLE_LABELS, type Role } from "../types";

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
  const { user, profile, hasRole } = useAuth();

  const displayName = profile?.display_name ?? user?.email ?? "";
  const roleLabel = profile ? ROLE_LABELS[profile.role as Role] : null;

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
              Catalogue d'activités
            </p>
          )}

          <nav className="space-y-2">
            <NavLink to="/" end className={navLinkClass}>
              📚 Catalogue
            </NavLink>

            {user && (
              <NavLink to="/favoris" className={navLinkClass}>
                ⭐ Mes favoris
              </NavLink>
            )}

            {hasRole("contributeur") && (
              <>
                <NavLink to="/mes-activites" className={navLinkClass}>
                  🗂️ Mes activités
                </NavLink>
                <NavLink to="/activites/nouvelle" className={navLinkClass}>
                  ➕ Nouvelle activité
                </NavLink>
              </>
            )}

            {hasRole("moderateur") && (
              <NavLink to="/archives" className={navLinkClass}>
                📦 Archives
              </NavLink>
            )}

            {hasRole("administrateur") && (
              <>
                <NavLink to="/admin/utilisateurs" className={navLinkClass}>
                  👥 Utilisateurs
                </NavLink>
                <NavLink to="/admin/referentiel" className={navLinkClass}>
                  🗃️ Données de référence
                </NavLink>
              </>
            )}

            {user && (
              <NavLink to="/profil" className={navLinkClass}>
                ⚙️ Profil
              </NavLink>
            )}
          </nav>
        </div>

        {user ? (
          <LogoutButton />
        ) : (
          <Link
            to="/login"
            className="text-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition font-semibold"
          >
            Se connecter
          </Link>
        )}
      </aside>

      {/* ----- Zone de contenu principale ----- */}
      <section className="flex-1 p-4 md:p-8">{children}</section>
    </div>
  );
}
