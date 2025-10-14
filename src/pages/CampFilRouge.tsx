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
  filRouge?: string;
};

export default function CampFilRouge() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [camp, setCamp] = useState<Camp | null>(null);
  const [filRouge, setFilRouge] = useState("");

  // 🔹 Charger les données du camp
  useEffect(() => {
    const storedCamps = JSON.parse(localStorage.getItem("camps") || "[]");
    const found = storedCamps.find((c: Camp) => c.id === Number(id));
    if (found) {
      setCamp(found);
      setFilRouge(found.filRouge || "");
    } else {
      navigate("/home");
    }
  }, [id, navigate]);

  // 🔹 Sauvegarder les modifications
  const handleSave = () => {
    if (!camp) return;
    const storedCamps = JSON.parse(localStorage.getItem("camps") || "[]");
    const updatedCamps = storedCamps.map((c: Camp) =>
      c.id === camp.id ? { ...c, filRouge } : c
    );
    localStorage.setItem("camps", JSON.stringify(updatedCamps));
    alert("Fil rouge enregistré !");
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
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Fil rouge</h1>
        <p className="text-gray-600 mb-6">
          Décris ici le <strong>thème narratif</strong> du camp — l’histoire qui
          guidera les activités, la mise en scène et les décors.
        </p>

        <textarea
          value={filRouge}
          onChange={(e) => setFilRouge(e.target.value)}
          placeholder="Exemple : une expédition de pirates, un voyage dans le temps, une mission spatiale..."
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
