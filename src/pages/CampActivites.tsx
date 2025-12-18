import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CampLayout from "../layouts/CampLayout";
import { supabase } from "../lib/supabaseClient";
import TimePicker15 from "../components/TimePicker15";
import { getCampActivities } from "../services/campServices";

type Activity = {
  id: number;
  name: string;
  category: string | null; // Type AC, SdC, AA
  relation_activity: string | null; // à son corps, à soi, etc...
  start_time: string;  // timestamp renvoyé par Supabase
  end_time: string;
  responsable: string | null;
  location: string | null;
  description: string | null;
  materials: string | null;
  index_in_day: number | null; // index journée (1.1, 2.3, 4.5)
};

function formatDateTime(dt: string) {
  const d = new Date(dt);
  return d.toLocaleString("fr-CH", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CampActivites() {
  const { id } = useParams<{ id: string }>();
  const campId = Number(id);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour le formulaire d’ajout
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [category, setCategory] = useState("");
  const [relationActivity, setRelationActivity] = useState("");
  const [responsable, setResponsable] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [materials, setMaterials] = useState("");
  const [saving, setSaving] = useState(false);

// Chargement des activités du camp
  useEffect(() => {
    if (!campId) return;

    async function fetchActivities() {
      setLoading(true);
      setError(null);

      // --- CORRECTION #1 (LECTURE INITIALE) ---
      try {
          const data = await getCampActivities(campId);
          setActivities(data || []);
      } catch (e) {
          console.error("Erreur chargement activités :", e);
          setError("Impossible de charger les activités.");
      }
      // ----------------------------------------

      setLoading(false);
    }

    fetchActivities();
  }, [campId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!campId) return;

    if (!date || !startTime || !endTime || !name) {
      alert("Nom, date, heure de début et de fin sont obligatoires.");
      return;
    }

    setSaving(true);

    // Construction des timestamps ISO simples (locale → string)
    const start = `${date}T${startTime}:00`;
    const end = `${date}T${endTime}:00`;

    const { error } = await supabase.from("activities").insert([
      {
        camp_id: campId,
        name,
        category: category || null,
        relation_activity: relationActivity || null,
        start_time: start,
        end_time: end,
        responsable: responsable || null,
        location: location || null,
        description: description || null,
        materials: materials || null,
        // index_in_day : pour l’instant on laisse à NULL,
        // on le calculera plus tard (au moment du DnD / ordre dans la journée)
      },
    ]);

    if (error) {
      console.error("Erreur création activité :", error);
      alert("Erreur lors de la création de l’activité.");
    } else {
      // Rechargement de la liste
      try {
          const data = await getCampActivities(campId);
          setActivities(data || []);
      } catch (e) {
          console.error("Erreur rechargement activités :", e);
      }      

      // Reset formulaire
      setName("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setCategory("");
      setRelationActivity("");
      setResponsable("");
      setLocation("");
      setDescription("");
      setMaterials("");
      setShowForm(false);
    }

    setSaving(false);
  }

  return (
    <CampLayout>
      <section className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Activités</h1>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            {showForm ? "Annuler" : "Ajouter une activité"}
          </button>
        </header>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="mb-8 bg-white p-4 rounded-xl shadow-sm grid gap-4 md:grid-cols-2"
          >
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1" htmlFor="name">
                Nom de l’activité
              </label>
              <input
                id="name"
                type="text"
                className="w-full border border-gray-300 rounded-md p-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="date">
                Date
              </label>
              <input
                id="date"
                type="date"
                className="w-full border border-gray-300 rounded-md p-2"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="startTime"
              >
                Début
              </label>
              <TimePicker15
                id="startTime"
                value={startTime}
                onChange={setStartTime}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="endTime"
              >
                Fin
              </label>
              <TimePicker15
                id="startTime"
                value={endTime}
                onChange={setEndTime}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Catégorie d’activité (SC, AC, AA…)
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="SdC, AC, AA"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Relation
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="À la personnalité, au corps…"
                value={relationActivity}
                onChange={(e) => setRelationActivity(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Responsable
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Lieu
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md p-2 min-h-[80px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Matériel
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md p-2 min-h-[60px]"
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {saving ? "Enregistrement..." : "Enregistrer l’activité"}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-gray-600">Chargement des activités…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : activities.length === 0 ? (
          <p className="text-gray-600">
            Aucune activité pour ce camp. Ajoute ta première activité ci-dessus.
          </p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 text-left text-sm text-gray-600">
                <tr>
                  <th className="px-4 py-2">Début</th>
                  <th className="px-4 py-2">Fin</th>
                  <th className="px-4 py-2">Nom</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Relation</th>
                  <th className="px-4 py-2">Lieu</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {activities.map((activity) => (
                  <tr key={activity.id} className="odd:bg-white even:bg-gray-50">
                    <td className="px-4 py-2">
                      {formatDateTime(activity.start_time)}
                    </td>
                    <td className="px-4 py-2">
                      {formatDateTime(activity.end_time)}
                    </td>
                    <td className="px-4 py-2">{activity.name}</td>
                    <td className="px-4 py-2">{activity.category}</td>
                    <td className="px-4 py-2">{activity.relation_activity}</td>
                    <td className="px-4 py-2">{activity.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </CampLayout>
  );
}
