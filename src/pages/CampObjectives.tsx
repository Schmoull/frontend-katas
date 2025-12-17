import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CampLayout from "../layouts/CampLayout";
import { supabase } from "../lib/supabaseClient";

type Camp = {
  id: number;
  name: string;
  objectifs?: string;
  owner_id?: string | null;
};

export default function CampObjectives() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [camp, setCamp] = useState<Camp | null>(null);
  const [objectifs, setObjectifs] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Charger le camp (id + name + objectifs)
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("camps")
        .select("id,name,objectifs")
        .eq("id", Number(id))
        .single();

      if (error || !data) {
        console.error("Erreur Supabase (load objectifs):", error);
        navigate("/home");
        return;
      }
      setCamp(data);
      setObjectifs(data.objectifs ?? "");
      setLoading(false);
    })();
  }, [id, navigate]);

  const handleSave = async () => {
    if (!camp) return;
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from("camps")
      .update({ objectifs })
      .eq("id", camp.id);

    if (error) {
      console.error("Erreur Supabase (update objectifs):", error);
      setMessage("❌ Échec de l’enregistrement.");
    } else {
      setMessage("✅ Objectifs enregistrés.");
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
        <h1 className="text-2xl font-bold mb-4 text-gray-900">
          Objectifs du camp — {camp.name}
        </h1>
        <p className="text-gray-600 mb-6">
          Décris les objectifs éducatifs et pédagogiques du camp.
        </p>

        <textarea
          value={objectifs}
          onChange={(e) => setObjectifs(e.target.value)}
          placeholder="Ex.: cohésion d’équipe, autonomie, entraide…"
          className="w-full min-h-[200px] border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-800"
        />

        <div className="mt-4 flex items-center justify-between">
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
