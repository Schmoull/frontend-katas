import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { supabase } from "../lib/supabaseClient";

export default function CreateCamp() {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [groupe, setGroupe] = useState("");
  const [unite, setUnite] = useState("");
  const [responsable, setResponsable] = useState("");
  const [location, setLocation] = useState("");
  const [theme, setTheme] = useState("");
  const [description, setDescription] = useState("");
  const [dayStartTime, setDayStartTime] = useState("");
  const [dayEndTime, setDayEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // ⚙️ Création de l’objet camp
    const newCamp = {
      name,
      start_date: startDate,
      end_date: endDate,
      day_start_time: dayStartTime,
      day_end_time: dayEndTime,
      groupe,
      unite,
      responsable,
      location,
      theme,
      description,
    };

    // 📤 Envoi à Supabase
    const { error } = await supabase.from("camps").insert([newCamp]);

    if (error) {
      console.error("❌ Erreur Supabase :", error);
      setMessage("Erreur : impossible de créer le camp.");
    } else {
      setMessage("✅ Camp créé avec succès !");
      // Réinitialise le formulaire
      setName("");
      setStartDate("");
      setEndDate("");
      setDayStartTime("");
      setDayEndTime("");
      setGroupe("");
      setUnite("");
      setResponsable("");
      setLocation("");
      setTheme("");
      setDescription("");
    }

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
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="dayStartTime"
              >
                Heure de début
              </label>
              <input
                id="dayStartTime"
                type="time"
                className="w-full rounded-md border border-gray-300 p-2"
                value={dayStartTime}
                onChange={(e) => setDayStartTime(e.target.value)}
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
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="dayEndTime"
              >
                Heure de fin
              </label>
              <input
                id="dayEndTime"
                type="time"
                className="w-full rounded-md border border-gray-300 p-2"
                value={dayEndTime}
                onChange={(e) => setDayEndTime(e.target.value)}
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
