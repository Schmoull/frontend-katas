import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getCampDetails } from "../services/campServices"; // Assurez-vous du chemin correct

type CampLayoutProps = {
  children: ReactNode;
};

type Camp = {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  groupe: string;
  unite: string;
  responsable: string;
  location: string;
  theme: string;
  description: string;
  objectifs?: string;
  fil_rouge?: string;
};

export default function CampLayout({ children }: CampLayoutProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [camp, setCamp] = useState<Camp | null>(null);

  useEffect(() => {
      (async () => {
        setLoading(true);

        let campData = null;
        try {
            // --- CORRECTION : UTILISER LE SERVICE RPC ---
            campData = await getCampDetails(Number(id)); 
        } catch (e) {
            console.error("Erreur RPC dans CampLayout:", e);
        }

        if (!campData) {
          console.error("Accès au camp non autorisé via CampLayout.");
          navigate("/home");
          return;
        }
        
        setCamp(campData);
        setLoading(false);
      })();
    }, [id, navigate]);

    if (loading || !camp) {
        return (
          <MainLayout>
            <p>Chargement…</p>
          </MainLayout>
        );
      }

  return (
    <div className="min-h-screen flex bg-gray-100 text-gray-900">
      {/* ----- Barre latérale du camp ----- */}
      <aside className="w-64 bg-white border-r shadow-sm p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold text-indigo-700 mb-4">{camp.name}</h2>

          <nav className="space-y-2">
            <NavLink
              to={`/camp/${id}/dashboard`}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md font-medium ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-indigo-100 text-gray-800"
                }`
              }
            >
              👀 Aperçu
            </NavLink>

            <NavLink
              to={`/camp/${id}/objectifs`}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md font-medium ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-indigo-100 text-gray-800"
                }`
              }
            >
              🎯 Objectifs
            </NavLink>

            <NavLink
              to={`/camp/${id}/fil-rouge`}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md font-medium ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-indigo-100 text-gray-800"
                }`
              }
            >
              🧵 Fil rouge
            </NavLink>

            <NavLink
              to={`/camp/${id}/planning`}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md font-medium ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-indigo-100 text-gray-800"
                }`
              }
            >
              📅 Picassos
            </NavLink>

            <NavLink
              to={`/camp/${id}/activites`}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md font-medium ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-indigo-100 text-gray-800"
                }`
              }
            >
              🏕️ Activités
            </NavLink>

            <NavLink
              to={`/camp/${id}/parametres`}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md font-medium ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-indigo-100 text-gray-800"
                }`
              }
            >
              ⚙️ Paramètres
            </NavLink>
          </nav>
        </div>

        <button
          onClick={() => navigate(`/camp/${id}`)}
          className="bg-gray-200 text-gray-800 rounded-md px-4 py-2 hover:bg-gray-300 transition font-medium"
        >
          ← Retour au camp
        </button>
      </aside>

      {/* ----- Zone principale ----- */}
      <section className="flex-1 p-8">{children}</section>
    </div>
  );
}
