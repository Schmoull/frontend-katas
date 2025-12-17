// src/pages/JoinCamp.tsx
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import MainLayout from "../layouts/MainLayout";

export default function JoinCamp() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!user) {
      setMsg("Vous devez être connecté.");
      return;
    }

    const cleaned = code.trim().toUpperCase();
    if (!cleaned) {
      setMsg("Veuillez entrer un code.");
      return;
    }

    setLoading(true);

    // 1) Trouver le camp_id via la table camp_invites (pas via camps)
    const { data: invite, error: inviteErr } = await supabase
      .from("camp_invites")
      .select("camp_id")
      .eq("code", cleaned)
      .maybeSingle();

    if (inviteErr) {
      console.error("Erreur camp_invites :", inviteErr);
      setMsg("Erreur lors de la recherche du code.");
      setLoading(false);
      return;
    }

    if (!invite) {
      setMsg("Code invalide.");
      setLoading(false);
      return;
    }

    // 2) Ajouter l'utilisateur comme membre
    const { error: memberErr } = await supabase.from("camp_members").insert([
      {
        camp_id: invite.camp_id,
        user_id: user.id,
        role: "member",
      },
    ]);

    // Cas fréquent : déjà membre (unique index)
    if (memberErr) {
      if (memberErr.code === "23505") {
        setMsg("Vous êtes déjà membre de ce camp.");
        navigate(`/camp/${invite.camp_id}`);
        setLoading(false);
        return;
      }

      console.error("Erreur ajout membre :", memberErr);
      setMsg("Impossible de rejoindre ce camp.");
      setLoading(false);
      return;
    }

    setMsg("✅ Vous avez rejoint le camp !");
    setLoading(false);

    navigate(`/camp/${invite.camp_id}`);
  }

  return (
    <MainLayout>
      <section className="max-w-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Rejoindre un camp
        </h1>
        <p className="text-gray-600 mb-6">
          Entre le code fourni par le responsable du camp.
        </p>

        {msg && <p className="mb-4 text-sm text-gray-700">{msg}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="code">
              Code
            </label>
            <input
              id="code"
              className="w-full border border-gray-300 rounded-md p-2 font-mono"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="CAMP-AB12CD"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Validation…" : "Rejoindre"}
          </button>
        </form>
      </section>
    </MainLayout>
  );
}
