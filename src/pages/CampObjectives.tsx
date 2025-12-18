import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CampLayout from "../layouts/CampLayout";
import { supabase } from "../lib/supabaseClient";
import { getCampDetails } from '../services/campServices';

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

      let campData = null;
      try {
          // --- UTILISATION DU SERVICE RPC SÉCURISÉ ---
          campData = await getCampDetails(Number(id)); 
      } catch (e) {
          console.error("Erreur RPC lors du chargement des Objectifs :", e);
      }
  
      if (!campData) {
        console.error("Accès au camp non autorisé ou camp non trouvé.");
        navigate("/home");
        return;
      }

      setCamp(campData); 
      setObjectifs(campData.objectifs ?? ""); // Utilisation de la donnée chargée par RPC
      setLoading(false);
    })();
  }, [id, navigate]);

const handleSave = async () => {
    if (!camp) return;
    setSaving(true);
    setMessage(null);

    let success = false;
    try {
        // --- REMPLACEMENT DE L'UPDATE DIRECT PAR L'APPEL RPC ---
        const { data, error } = await supabase.rpc("update_camp_objectifs", {
            p_camp_id: camp.id,
            p_objectifs: objectifs, // Le nom du paramètre dans le RPC doit correspondre
        });

        if (error) {
            throw error;
        }
        
        success = data === true; 
        
    } catch (error) {
      console.error("Erreur Supabase (update objectifs via RPC):", error);
      setMessage("❌ Échec de l’enregistrement ou accès refusé.");
    }

    if (success) {
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
