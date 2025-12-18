// src/pages/CampSettings.tsx - MISE À JOUR

import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CampLayout from "../layouts/CampLayout";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

// Import des types et services
// Import des types et services
import type { Camp, CampMember } from "../types";
import { getCampMembers, removeCampMember, updateMemberRole } from "../services/campMembersService"; // Nouveau service
import { getCampDetails } from "../services/campServices";

export default function CampSettings() {
  const { id } = useParams<{ id: string }>();
  const campId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Utilisation des types importés
  const [camp, setCamp] = useState<Camp | null>(null);
  const [members, setMembers] = useState<CampMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copyOk, setCopyOk] = useState(false);

  // Fonction pour charger toutes les données, incluant les membres via le service
  const fetchData = useCallback(async () => {
    if (!campId || !user) return;

    setLoading(true);
    setError(null);

    try {
      // 1) Charger le camp
      const campData = await getCampDetails(campId);

    if (!campData) {
        throw new Error("Impossible de charger les paramètres du camp ou accès refusé.");
    }

    setCamp(campData as Camp);

      // 2) Charger les membres du camp via le service
      const memberData = await getCampMembers(campId);
      setMembers(memberData || []);

      // 3) Charger le code d'invitation (inchangé)
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
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Une erreur est survenue lors du chargement.");
    } finally {
      setLoading(false);
    }
  }, [campId, user]); // Dépendances inchangées

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- NOUVELLES FONCTIONS DE GESTION DES MEMBRES ---

  async function handleRemoveMember(memberId: string, isCurrentUser: boolean) {
    if (!camp || !user || camp.owner_id !== user.id) return;

    const memberToRemove = members.find(m => m.id === memberId);
    if (!memberToRemove) return;

    if (memberToRemove.role === 'owner') {
        alert("Attention : Vous ne pouvez pas retirer le propriétaire du camp.");
        return;
    }
    
    if (isCurrentUser) {
        const confirmed = window.confirm(
            "Es-tu sûr de vouloir quitter ce camp ? Tu devras être réinvité pour le rejoindre."
        );
        if (!confirmed) return;
    } else {
        const confirmed = window.confirm(
            "Es-tu sûr de vouloir retirer ce membre du camp ?"
        );
        if (!confirmed) return;
    }

    try {
      await removeCampMember(memberId);
      // Mise à jour de l'état local ou rechargement
      if (isCurrentUser) {
          navigate("/home"); // Redirection si l'utilisateur se retire lui-même
      } else {
          await fetchData(); // Recharger la liste des membres
      }
    } catch (e) {
      console.error(e);
      alert("Erreur lors du retrait du membre.");
    }
  }
  
  async function handleUpdateRole(memberId: string, newRole: CampMember['role']) {
    if (!camp || !user || camp.owner_id !== user.id) return;
    
    // Logique de sécurité simple : Empêcher le propriétaire de rétrograder ou promouvoir l'owner lui-même
    const memberToUpdate = members.find(m => m.id === memberId);
    if (memberToUpdate?.user_id === camp.owner_id && newRole !== 'owner') {
        alert("Attention : Le propriétaire ne peut pas changer son propre rôle.");
        return;
    }

    try {
      await updateMemberRole(memberId, newRole);
      await fetchData(); // Recharger la liste des membres pour voir le changement
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la mise à jour du rôle.");
    }
  }

  // --- FONCTION SUPPRESSION CAMP (inchangée) ---
  async function handleDeleteCamp() {
      if (!campId) return;
      if (!user || !camp) return;

      // ... (Logique de vérification isOwner et confirmation inchangée) ...
      if (camp.owner_id !== user.id) {
          alert("Seul le propriétaire du camp peut le supprimer.");
          return;
      }

      const confirmed = window.confirm(
        "Es-tu sûr de vouloir supprimer définitivement ce camp ? Cette action est irréversible."
      );
      if (!confirmed) return;

      setDeleting(true);

      // --- REMPLACEMENT DE LA SUPPRESSION DIRECTE PAR RPC ---
      try {
          const { data, error } = await supabase.rpc("delete_camp_by_owner", {
              p_camp_id: campId,
          });

          if (error || data !== true) {
              throw error;
          }

      } catch (error) {
          console.error("Erreur suppression camp (RPC) :", error);
          alert("Erreur lors de la suppression du camp ou accès refusé.");
          setDeleting(false);
          return;
      }
      // -----------------------------------------------------

      setDeleting(false);
      
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
  
  // --- RENDU (LÉGÈREMENT MODIFIÉ) ---
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
        {/* En-tête (inchangé) */}
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
          {/* Bloc code d'invitation (inchangé) */}
          <div className="mb-4 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
             {/* ... Reste du code pour l'affichage et la copie du code (inchangé) */}
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

          {/* Liste des membres avec Actions */}
          {members.length === 0 ? (
            <p className="text-gray-600 text-sm">
              Aucun membre n&apos;est associé à ce camp pour le moment.
            </p>
          ) : (
            <div className="space-y-2">
              {members.map((m) => {
                const isCurrentUser = !!user && m.user_id === user.id; // <-- !! force le cast en boolean (true/false)
                const canBeRemoved = m.role !== 'owner'; // On ne peut pas retirer le propriétaire
                
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {/* Affiche l'email ou un ID pour le moment */}
                        {isCurrentUser ? "Vous" : `Membre ID: ${m.user_id.slice(0, 8)}...`}
                        
                        {m.role === "owner" ? (
                          <span className="ml-2 text-xs text-indigo-600 border border-indigo-200 rounded-full px-2 py-0.5">
                            Propriétaire
                          </span>
                        ) : (
                          <span className="ml-2 text-xs text-gray-500 border border-gray-200 rounded-full px-2 py-0.5">
                            {m.role === 'admin' ? 'Administrateur' : 'Membre simple'}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isCurrentUser ? `(Rôle: ${m.role})` : `ID Membre: ${m.id.slice(0, 8)}...`}
                      </p>
                    </div>

                    {/* Actions de gestion des membres (visibles uniquement au propriétaire) */}
                    {isOwner && (
                      <div className="flex space-x-2">
                         {/* Bouton de changement de rôle (si pas l'utilisateur courant, ni le owner) */}
                         {m.user_id !== camp.owner_id && (
                             <button
                                onClick={() => 
                                    handleUpdateRole(
                                        m.id, 
                                        m.role === 'admin' ? 'member' : 'admin'
                                    )
                                }
                                className="px-3 py-1 text-xs rounded-md bg-yellow-500 text-white hover:bg-yellow-600 transition disabled:opacity-50"
                                disabled={m.user_id === camp.owner_id} // Sécurité supplémentaire
                             >
                                {m.role === 'admin' ? 'Rétrograder' : 'Promouvoir Admin'}
                             </button>
                         )}

                         {/* Bouton pour retirer/quitter le camp */}
                         {/* On affiche un bouton "Quitter" pour l'utilisateur courant ou "Retirer" pour le propriétaire */}
                         <button
                           onClick={() => handleRemoveMember(m.id, isCurrentUser)}
                           className={`px-3 py-1 text-xs rounded-md ${
                               isCurrentUser 
                               ? 'bg-gray-400 text-white hover:bg-gray-500' // Quitter
                               : 'bg-red-500 text-white hover:bg-red-600' // Retirer
                           } transition disabled:opacity-50`}
                           disabled={!canBeRemoved && !isCurrentUser} // Si c'est le owner (et pas soi-même), on ne peut pas le retirer
                         >
                           {isCurrentUser ? 'Quitter le camp' : 'Retirer'}
                         </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Texte d'information (mis à jour) */}
          <p className="mt-4 text-xs text-gray-500">
            La gestion des membres (retrait/rôle) est activée pour le propriétaire.
          </p>
        </div>

        {/* Bloc danger : suppression (inchangé) */}
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