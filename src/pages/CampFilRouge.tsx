import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CampLayout from "../layouts/CampLayout";
import { supabase } from "../lib/supabaseClient";

type Camp = {
  id: number;
  name: string;
  fil_rouge?: string;
  owner_id?: string | null;
};

export default function CampFilRouge() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [camp, setCamp] = useState<Camp | null>(null);
  const [fil_rouge, setFilRouge] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Charger le camp (id + name + objectifs)
    useEffect(() => {
      (async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from("camps")
          .select("id,name,fil_rouge")
          .eq("id", Number(id))
          .single();
  
        if (error || !data) {
          console.error("Erreur Supabase (load fil rouge):", error);
          navigate("/home");
          return;
        }
        setCamp(data);
        setFilRouge(data.fil_rouge ?? "");
        setLoading(false);
      })();
    }, [id, navigate]);
  
    const handleSave = async () => {
      if (!camp) return;
      setSaving(true);
      setMessage(null);
  
      const { error } = await supabase
        .from("camps")
        .update({ fil_rouge })
        .eq("id", camp.id);
  
      if (error) {
        console.error("Erreur Supabase (update fil rouge):", error);
        setMessage("❌ Échec de l’enregistrement.");
      } else {
        setMessage("✅ Fil rouge enregistré.");
      }
      setSaving(false);
    };
  
    if (loading || !camp) {
      return (
        <CampLayout>
          <p>Chargement…</p>
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
          value={fil_rouge}
          onChange={(e) => setFilRouge(e.target.value)}
          placeholder="Exemple : une expédition de pirates, un voyage dans le temps, une mission spatiale..."
          className="w-full min-h-[200px] border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-800"
        />

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
          {message && (
            <span
              className={`text-sm ${
                message.startsWith("✅") ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </span>
          )}
        </div>
      </section>
    </CampLayout>
  );
}
