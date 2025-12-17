// src/pages/Camp.tsx  (ou CampDetails.tsx)
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { supabase } from "../lib/supabaseClient";

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
  owner_id?: string | null;
};

export default function Camp() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [camp, setCamp] = useState<Camp | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("camps")
        .select("*")
        .eq("id", Number(id))
        .single(); // 👈 prend 1 ligne

      if (error || !data) {
        console.error(error);
        navigate("/home");
        return;
      }
      setCamp(data);
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
    <MainLayout>
      <section className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">{camp.name}</h1>
        <p className="text-gray-500 mb-4">
          📍 {camp.location} | 🗓️ {camp.start_date} → {camp.end_date} <br></br>
          🤼‍♂️ {camp.groupe} | ⚜️ {camp.unite} : 🤦‍♂️ {camp.responsable}
        </p>

        <img
          src="/assets/img/default-camp.png"
          alt="Image du camp"
          className="w-full h-64 object-cover rounded-md mb-6"
        />

        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {camp.theme}<br></br>
          {camp.description}
        </p>

        <div className="mt-8 flex gap-3">
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
