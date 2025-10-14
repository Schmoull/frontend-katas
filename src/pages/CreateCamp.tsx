import { useState } from "react";
import MainLayout from "../layouts/MainLayout";

export default function CreateCamp() {
  // États pour stocker les valeurs du formulaire
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [groupe, setGroupe] = useState("");
  const [unite, setUnite] = useState("");
  const [responsable, setResponsable] = useState("");
  const [location, setLocation] = useState("");
  const [theme, setTheme] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newCamp = {
      id: Date.now(),
      name,
      startDate,
      endDate,
      groupe,
      unite,
      responsable,
      location,
      theme,
      description,
    };

    // Pour l’instant, on stocke simplement dans le localStorage
    const camps = JSON.parse(localStorage.getItem("camps") || "[]");
    camps.push(newCamp);
    localStorage.setItem("camps", JSON.stringify(camps));

    // Réinitialise le formulaire
    setName("");
    setStartDate("");
    setEndDate("");
    setGroupe("");
    setUnite("");
    setResponsable("");
    setLocation("");
    setTheme("");
    setDescription("");

    alert("Camp créé avec succès !");
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

          {/* Unite */}
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

          {/* Responsable du camp */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="responsable">
              Responsable du camp
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
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décris brièvement ton camp..."
              required
            />
          </div>

          {/* Bouton */}
          <div className="pt-4">
            <button
              type="submit"
              className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-indigo-700 transition"
            >
              Enregistrer le camp
            </button>
          </div>
        </form>
      </section>
    </MainLayout>
  );
}