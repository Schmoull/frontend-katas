import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import { useAuth } from "../contexts/AuthContext";

type MainLayoutProps = {
  children: ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {

  const { user } = useAuth();

  // 2️⃣ Extraire l'email (ou un fallback)
  const userEmail = user?.email ?? "Utilisateur inconnu";

  // 3️⃣ Créer les initiales à partir de l'email
  const initials = userEmail
    .charAt(0)
    .toUpperCase() + (userEmail.split("@")[0].charAt(1)?.toUpperCase() || "");

  return (
    <div className="min-h-screen flex bg-gray-100 text-gray-900">
      {/* ----- Barre latérale ----- */}
      <aside className="w-64 bg-white border-r shadow-sm p-6 flex flex-col justify-between">
        <div>
          {/* Profil utilisateur */}
          <div className="text-center mb-8">
            <div className="mx-auto size-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold">
              {initials}
            </div>
            <p className="mt-2 font-semibold">{user?.email}</p>
            <p className="text-sm text-gray-500">Responsable</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md font-medium ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-indigo-100 text-gray-800"
                }`
              }
            >
              🏕️ Mes camps
            </NavLink>

            <NavLink
              to="/create-camp"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md font-medium ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-indigo-100 text-gray-800"
                }`
              }
            >
              ➕ Créer un camp
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md font-medium ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-indigo-100 text-gray-800"
                }`
              }
            >
              ⚙️ Profil
            </NavLink>
          </nav>
        </div>

        {/* Bouton de déconnexion */}
        <LogoutButton />
      </aside>

      {/* ----- Zone de contenu principale ----- */}
      <section className="flex-1 p-8">{children}</section>
    </div>
  );
}
