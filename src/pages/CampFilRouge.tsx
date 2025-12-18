import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CampLayout from "../layouts/CampLayout";
import { supabase } from "../lib/supabaseClient";
import { getCampDetails } from '../services/campServices'; // Assurez-vous du chemin correct

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

        let campData = null;
        try {
            // --- UTILISATION DU SERVICE RPC SÉCURISÉ ---
            campData = await getCampDetails(Number(id)); 
        } catch (e) {
            console.error("Erreur RPC lors du chargement du Fil Rouge :", e);
        }
  
        if (!campData) {
          console.error("Accès au camp non autorisé ou camp non trouvé.");
          navigate("/home");
          return;
        }

        // Étant donné que campData est de type Camp (défini par le service), 
        // vous pouvez l'utiliser directement :
        setCamp(campData); 
        setFilRouge(campData.fil_rouge ?? ""); // Utilisation de la donnée chargée par RPC
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
          const { data, error } = await supabase.rpc("update_camp_fil_rouge", {
              p_camp_id: camp.id,
              p_fil_rouge: fil_rouge, // Le nom du paramètre dans le RPC doit correspondre
          });

          if (error) {
              throw error; // Lancer l'erreur pour la capturer en dessous
          }
          
          // La fonction RPC retourne true si la mise à jour a réussi
          success = data === true; 
          
      } catch (error) {
        console.error("Erreur Supabase (update fil rouge via RPC):", error);
        setMessage("❌ Échec de l’enregistrement ou accès refusé.");
      }
  
      if (success) {
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
