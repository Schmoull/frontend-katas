import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import CampLayout from "../layouts/CampLayout";
import { getCampDetails } from "../services/campServices";

type Camp = {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  responsable: string;
  location: string;
  description: string;
  objectifs?: string;
  fil_rouge?: string;
  owner_id?: string | null;
};

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export default function CampDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [camp, setCamp] = useState<Camp | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullDesc, setShowFullDesc] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      
      let campData = null;
      try {
        // --- MODIFICATION ICI : Appel de la fonction de service RPC ---
        campData = await getCampDetails(Number(id)); 
      } catch (e) {
        console.error("Erreur RPC lors du chargement du Dashboard :", e);
      }

      if (!campData) {
        console.error("Accès au camp non autorisé ou camp non trouvé.");
        // Rediriger vers la page d'accueil en cas d'échec
        navigate("/home"); 
        return;
      }
      
      setCamp(campData);
      setLoading(false);
    })();
  }, [id, navigate]);

  if (loading || !camp) {
    // Reste inchangé
    return (
      <CampLayout>
        <p>Chargement…</p>
      </CampLayout>
    );
  }

  return (
    <CampLayout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">{camp.name}</h1>
        <p className="text-gray-500">
          📍 {camp.location} | 🗓️ {camp.start_date} → {camp.end_date}
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Description</h2>
          <div className="text-gray-700 leading-relaxed">
            <p>{truncate(camp.description, 500)}</p>
            {camp.description.length > 500 && (
              <button
                onClick={() => setShowFullDesc(true)}
                className="mt-2 text-indigo-600 text-sm font-medium hover:underline"
              >
                Voir plus
              </button>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Résumé</h2>
          <ul className="space-y-2 text-gray-700">
            <li>🤦‍♂️ Responsable de camp : <strong>{camp.responsable}</strong></li>
            <li>🎯 Objectifs : <strong>{camp.objectifs ? "renseignés" : "à compléter"}</strong></li>
            <li>🧵 Fil rouge : <strong>{camp.fil_rouge ? "renseigné" : "à compléter"}</strong></li>
          </ul>
        </div>

        {(!camp.objectifs || !camp.fil_rouge) && (
        <div className="md:col-span-2 bg-indigo-50 p-6 rounded-xl border border-indigo-100">
          <h2 className="text-lg font-semibold text-indigo-700 mb-2">Prochaine étape</h2>
          <p className="text-gray-800">
            Complète les <strong>objectifs</strong> et le <strong>fil rouge</strong> via le menu à gauche.
          </p>
        </div>
        )}

        <div className="md:col-span-2 bg-indigo-50 p-6 rounded-xl border border-indigo-100">
          <h2 className="text-lg font-semibold text-indigo-700 mb-2">Etape suivante</h2>
          <p className="text-gray-800">
            Compléter le <strong>Picassos</strong> en remplissant vos activités.
          </p>
        </div>
      </section>

      {showFullDesc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-[90%] shadow-lg relative">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Description complète</h3>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {camp.description}
            </p>
            <button
              onClick={() => setShowFullDesc(false)}
              className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

    </CampLayout>
  );
}
