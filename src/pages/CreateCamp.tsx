import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import type { FormEvent } from "react";

function generateInviteCode() {
  return "CAMP-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function CreateCamp() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [groupe, setGroupe] = useState("");
  const [unite, setUnite] = useState("");
  const [responsable, setResponsable] = useState("");
  const [location, setLocation] = useState("");
  const [theme, setTheme] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const inviteCode = generateInviteCode();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      alert("Vous devez être connecté pour créer un camp.");
      return;
    }

    setLoading(true);
    setMessage("");

    // 1) Objet camp à insérer
    const newCamp = {
      // 🧾 Champs existants
      name,
      start_date: startDate,
      end_date: endDate,
      groupe,
      unite,
      responsable,
      location,
      theme,
      description,

      // 🆕 Champs demandés
      objectifs: null,
      fil_rouge: null,
      owner_id: user.id, // id Supabase de l'utilisateur connecté
      invite_code: inviteCode
    };

    // 2) Création du camp + récupération de son id
    const { data: insertedCamp, error } = await supabase
      .from("camps")
      .insert([newCamp])
      .select("id")
      .single();

    if (error || !insertedCamp) {
      console.error("❌ Erreur Supabase (création camp) :", error);
      setMessage("Erreur : impossible de créer le camp.");
      setLoading(false);
      return;
    }

    // 3) Ajout automatique du créateur comme membre 'owner'
    const { error: memberError } = await supabase.from("camp_members").insert([
      {
        camp_id: insertedCamp.id,
        user_id: user.id,
        role: "owner",
      },
    ]);

    await supabase.from("camp_invites").insert([
      { camp_id: insertedCamp.id, code: inviteCode }
    ]);

    if (memberError) {
      console.error("⚠️ Erreur ajout membre owner :", memberError);
      // on ne bloque pas, mais on log l'erreur
    }

    // 4) Reset du formulaire comme avant
    setMessage("✅ Camp créé avec succès !");
    setName("");
    setStartDate("");
    setEndDate("");
    setGroupe("");
    setUnite("");
    setResponsable("");
    setLocation("");
    setTheme("");
    setDescription("");

    setLoading(false);
  };

  return (
    <MainLayout>
      <section className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          Créer un nouveau camp
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom du camp */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="name">
              Nom du camp
            </label>
            <input
              id="name"
              type="text"
              className="w-full rounded-md border border-gray-300 p-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="startDate"
              >
                Date de début
              </label>
              <input
                id="startDate"
                type="date"
                className="w-full rounded-md border border-gray-300 p-2"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="endDate"
              >
                Date de fin
              </label>
              <input
                id="endDate"
                type="date"
                className="w-full rounded-md border border-gray-300 p-2"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Groupe */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="groupe">
              Groupe
            </label>
            <input
              id="groupe"
              type="text"
              className="w-full rounded-md border border-gray-300 p-2"
              value={groupe}
              onChange={(e) => setGroupe(e.target.value)}
              required
            />
          </div>

          {/* Unité */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="unite">
              Unité
            </label>
            <input
              id="unite"
              type="text"
              className="w-full rounded-md border border-gray-300 p-2"
              value={unite}
              onChange={(e) => setUnite(e.target.value)}
              required
            />
          </div>

          {/* Responsable */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="responsable">
              Responsable
            </label>
            <input
              id="responsable"
              type="text"
              className="w-full rounded-md border border-gray-300 p-2"
              value={responsable}
              onChange={(e) => setResponsable(e.target.value)}
              required
            />
          </div>

          {/* Lieu */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="location">
              Lieu
            </label>
            <input
              id="location"
              type="text"
              className="w-full rounded-md border border-gray-300 p-2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          {/* Thème */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="theme">
              Thème
            </label>
            <input
              id="theme"
              type="text"
              className="w-full rounded-md border border-gray-300 p-2"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              id="description"
              className="w-full rounded-md border border-gray-300 p-2 min-h-[100px]"
              value={description}

              onChange={(e) => {
                if (e.target.value.length <= 2500){
                  setDescription(e.target.value);
                }
              }}
              maxLength={2500}
              placeholder="Décris brièvement ton camp... (max 5000 caractères)"
              required
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {description.length}/2500 caractères
            </div>
          </div>

          {/* Bouton */}
          <div className="pt-4 flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? "Création..." : "Enregistrer le camp"}
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
        </form>
      </section>
    </MainLayout>
  );
}
