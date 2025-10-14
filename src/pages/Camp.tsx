import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";

type Camp = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
};

export default function Camp() {
  const { id } = useParams<{ id: string }>(); // 🔹 Récupère l’ID dans l’URL
  const [camp, setCamp] = useState<Camp | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCamps = JSON.parse(localStorage.getItem("camps") || "[]");
    const foundCamp = storedCamps.find((c: Camp) => c.id === Number(id));
    if (foundCamp) {
      setCamp(foundCamp);
    } else {
      // Camp non trouvé → redirection
      navigate("/home");
    }
  }, [id, navigate]);

  if (!camp) {
    return (
      <MainLayout>
        <p>Chargement...</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">{camp.name}</h1>
        <p className="text-gray-500 mb-4">
          📍 {camp.location} | 🗓️ {camp.startDate} → {camp.endDate}
        </p>

        <img
          src="/assets/img/default-camp.png"
          alt="Image du camp"
          className="w-full h-64 object-cover rounded-md mb-6"
        />

        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {camp.description}
        </p>

        <div className="mt-8">
          <button
            onClick={() => navigate("/home")}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
          >
            ← Retour à la liste
          </button>
          <button
            onClick={() => navigate(`/camp/${camp.id}/dashboard`)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            Accéder à ce camp →
          </button>
        </div>
      </section>
    </MainLayout>
  );
}
