// src/pages/CampSettings.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CampLayout from "../layouts/CampLayout";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

type Camp = {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  owner_id?: string | null;
};

type CampMember = {
  id: string;
  camp_id: number;
  user_id: string;
  role: string;
  created_at: string;
};

export default function CampSettings() {
  const { id } = useParams<{ id: string }>();
  const campId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [camp, setCamp] = useState<Camp | null>(null);
  const [members, setMembers] = useState<CampMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copyOk, setCopyOk] = useState(false);

  useEffect(() => {
    if (!campId || !user) return;

    async function fetchData() {
      setLoading(true);
      setError(null);

      // 1) Charger le camp
      const { data: campData, error: campError } = await supabase
        .from("camps")
        .select("id, name, start_date, end_date, owner_id")
        .eq("id", campId)
        .single();

      if (campError || !campData) {
        console.error("Erreur chargement camp (settings) :", campError);
        setError("Impossible de charger les paramètres du camp.");
        setLoading(false);
        return;
      }

      setCamp(campData);

      // 2) Charger les membres du camp
      const { data: memberData, error: memberError } = await supabase
        .from("camp_members")
        .select("id, camp_id, user_id, role, created_at")
        .eq("camp_id", campId)
        .order("created_at", { ascending: true });

      if (memberError) {
        console.error("Erreur chargement membres :", memberError);
        setError("Impossible de charger la liste des membres.");
        setLoading(false);
        return;
      }

      setMembers(memberData || []);
      setLoading(false);

      // 3) Charger le code d'invitation
      const { data: inviteData, error: inviteError } = await supabase
        .from("camp_invites")
        .select("code")
        .eq("camp_id", campId)
        .maybeSingle();

      if (inviteError) {
        console.error("Erreur chargement camp_invites :", inviteError);
      } else {
        setInviteCode(inviteData?.code ?? null);
      }
    }

    fetchData();
  }, [campId, user]);

  async function handleDeleteCamp() {
    if (!campId) return;
    if (!user || !camp) return;

    // par sécurité côté UI : seul le owner voit / peut utiliser ce bouton
    if (camp.owner_id !== user.id) {
      alert("Seul le propriétaire du camp peut le supprimer.");
      return;
    }

    const confirmed = window.confirm(
      "Es-tu sûr de vouloir supprimer définitivement ce camp ? Cette action est irréversible."
    );
    if (!confirmed) return;

    setDeleting(true);

    const { error } = await supabase
      .from("camps")
      .delete()
      .eq("id", campId);

    setDeleting(false);

    if (error) {
      console.error("Erreur suppression camp :", error);
      alert("Erreur lors de la suppression du camp.");
      return;
    }

    // Après suppression, retour à la page d'accueil des camps
    navigate("/home");
  }

  if (loading) {
    return (
      <CampLayout>
        <p className="text-gray-600">Chargement des paramètres…</p>
      </CampLayout>
    );
  }

  if (error || !camp) {
    return (
      <CampLayout>
        <p className="text-red-600">
          {error ?? "Impossible de charger les paramètres du camp."}
        </p>
      </CampLayout>
    );
  }

  const isOwner = user && camp.owner_id === user.id;

  return (
    <CampLayout>
      <section className="max-w-4xl mx-auto space-y-8">
        {/* En-tête */}
        <header>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Paramètres du camp
          </h1>
          <p className="text-gray-600">
            Camp <strong>{camp.name}</strong> ·{" "}
            <span className="text-sm text-gray-500">
              {camp.start_date} → {camp.end_date}
            </span>
          </p>
        </header>

        {/* Bloc membres */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Membres du camp
          </h2>
          <div className="mb-4 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">Code d’invitation</p>
              <p className="text-xs text-gray-600">
                {inviteCode ? (
                  <span className="font-mono">{inviteCode}</span>
                ) : (
                  "Aucun code disponible."
                )}
              </p>
            </div>

            <button
              type="button"
              disabled={!inviteCode}
              onClick={async () => {
                if (!inviteCode) return;
                await navigator.clipboard.writeText(inviteCode);
                setCopyOk(true);
                window.setTimeout(() => setCopyOk(false), 1200);
              }}
              className="px-3 py-1 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {copyOk ? "Copié ✅" : "Copier"}
            </button>
          </div>

          {members.length === 0 ? (
            <p className="text-gray-600 text-sm">
              Aucun membre n&apos;est associé à ce camp pour le moment.
            </p>
          ) : (
            <div className="space-y-2">
              {members.map((m) => {
                const isCurrentUser = user && m.user_id === user.id;

                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {isCurrentUser ? "Vous" : "Membre"}
                        {m.role === "owner" && (
                          <span className="ml-2 text-xs text-indigo-600 border border-indigo-200 rounded-full px-2 py-0.5">
                            Propriétaire
                          </span>
                        )}
                        {m.role !== "owner" && (
                          <span className="ml-2 text-xs text-gray-500 border border-gray-200 rounded-full px-2 py-0.5">
                            {m.role}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        ID utilisateur :{" "}
                        <span className="font-mono">
                          {m.user_id.slice(0, 8)}…
                        </span>
                      </p>
                    </div>

                    {/* Pour l'instant, pas encore d'actions (suppression / changement de rôle) */}
                  </div>
                );
              })}
            </div>
          )}

          <p className="mt-4 text-xs text-gray-500">
            Pour l&apos;instant, les membres sont ajoutés automatiquement
            lorsque le camp est créé (propriétaire). L&apos;ajout d&apos;autres
            responsables par invitation sera implémenté plus tard.
          </p>
        </div>

        {/* Bloc danger : suppression */}
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-700 mb-2">
            Zone dangereuse
          </h2>
          <p className="text-sm text-gray-700 mb-4">
            La suppression d&apos;un camp est définitive. Toutes les activités
            associées seront également supprimées.
          </p>

          <button
            type="button"
            onClick={handleDeleteCamp}
            disabled={!isOwner || deleting}
            className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium 
              ${
                isOwner
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              } disabled:opacity-60`}
          >
            {deleting
              ? "Suppression en cours…"
              : "Supprimer définitivement ce camp"}
          </button>
          {!isOwner && (
            <p className="mt-2 text-xs text-gray-500">
              Seul le propriétaire du camp peut le supprimer.
            </p>
          )}
        </div>
      </section>
    </CampLayout>
  );
}