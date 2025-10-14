import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import CampLayout from "../layouts/CampLayout";

type Camp = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
};

export default function CampDashboard() {
  const { id } = useParams<{ id: string }>();
  const [camp, setCamp] = useState<Camp | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCamps = JSON.parse(localStorage.getItem("camps") || "[]");
    const found = storedCamps.find((c: Camp) => c.id === Number(id));
    if (found) {
      setCamp(found);
    } else {
      navigate("/home");
    }
  }, [id, navigate]);

  if (!camp) {
    return (
      <CampLayout>
        <p>Chargement...</p>
      </CampLayout>
    );
  }

  return (
    <CampLayout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          {camp.name}
        </h1>
        <p className="text-gray-500">
          📍 {camp.location} | 🗓️ {camp.startDate} → {camp.endDate}
        </p>
      </header>

      {/* Aperçu principal */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* Bloc 1 : description */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-2 text-gray-900">
            Description du camp
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {camp.description}
          </p>
        </div>

        {/* Bloc 2 : résumé / statistiques */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Résumé général
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li>👥 Nombre de participants : <strong>à définir</strong></li>
            <li>🎯 Objectif principal : <strong>à compléter</strong></li>
            <li>🏕️ Type de camp : <strong>à définir</strong></li>
            <li>🗂️ Dernière mise à jour : <strong>automatiser plus tard</strong></li>
          </ul>
        </div>

        {/* Bloc 3 : prochaine étape */}
        <div className="md:col-span-2 bg-indigo-50 p-6 rounded-xl border border-indigo-100">
          <h2 className="text-lg font-semibold text-indigo-700 mb-2">
            Prochaine étape
          </h2>
          <p className="text-gray-800">
            Complète les <strong>objectifs</strong> et le <strong>fil rouge</strong> du camp dans le menu à gauche
            pour préparer la planification des activités.
          </p>
          <button
            onClick={() => navigate(`/camp/${camp.id}/objectifs`)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            → Aller aux objectifs
          </button>
        </div>
      </section>
    </CampLayout>
  );
}
