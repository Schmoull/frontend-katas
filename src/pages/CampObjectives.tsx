import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CampLayout from "../layouts/CampLayout";

type Camp = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  objectifs?: string; // nouveau champ facultatif
};

export default function CampObjectives() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [camp, setCamp] = useState<Camp | null>(null);
  const [objectifs, setObjectifs] = useState("");

  // 🔹 Charger le camp et ses objectifs existants
  useEffect(() => {
    const storedCamps = JSON.parse(localStorage.getItem("camps") || "[]");
    const found = storedCamps.find((c: Camp) => c.id === Number(id));
    if (found) {
      setCamp(found);
      setObjectifs(found.objectifs || "");
    } else {
      navigate("/home");
    }
  }, [id, navigate]);

  // 🔹 Sauvegarder les nouveaux objectifs
  const handleSave = () => {
    if (!camp) return;
    const storedCamps = JSON.parse(localStorage.getItem("camps") || "[]");
    const updatedCamps = storedCamps.map((c: Camp) =>
      c.id === camp.id ? { ...c, objectifs } : c
    );
    localStorage.setItem("camps", JSON.stringify(updatedCamps));
    alert("Objectifs enregistrés !");
  };

  if (!camp) {
    return (
      <CampLayout>
        <p>Chargement...</p>
      </CampLayout>
    );
  }

  return (
    <CampLayout>
      <section className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">
          Objectifs du camp
        </h1>
        <p className="text-gray-600 mb-6">
          Décris ici les <strong>objectifs éducatifs, pédagogiques et humains</strong> de ce camp.
        </p>

        <textarea
          value={objectifs}
          onChange={(e) => setObjectifs(e.target.value)}
          placeholder="Exemples : renforcer la cohésion d’équipe, développer l’autonomie, favoriser l’entraide..."
          className="w-full min-h-[200px] border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-800"
        />

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium"
          >
            Enregistrer
          </button>
        </div>
      </section>
    </CampLayout>
  );
}
