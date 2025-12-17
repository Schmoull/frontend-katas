// src/features/planning/CreateActivityModal.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import TimePicker15 from "../../components/TimePicker15";

type Props = {
  open: boolean;
  onClose: () => void;
  campId: number;
  defaultDate: string;
  defaultStartTime: string;
  defaultEndTime: string;
  onCreated?: () => void; // callback pour recharger les activités
};

export default function CreateActivityModal({
  open,
  onClose,
  campId,
  defaultDate,
  defaultStartTime,
  defaultEndTime,
  onCreated,
}: Props) {
  const [name, setName] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);
  const [relationActivity, setRelationActivity] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [responsable, setResponsable] = useState("");
  const [description, setDescription] = useState("");
  const [materials, setMaterial] = useState("");
  const [saving, setSaving] = useState(false);

  // Quand les valeurs par défaut changent (double-clic ailleurs), on les réinjecte
  useEffect(() => {
    setDate(defaultDate);
    setStartTime(defaultStartTime);
    setEndTime(defaultEndTime);
  }, [defaultDate, defaultStartTime, defaultEndTime]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!campId) return;

    if (!name || !date || !startTime || !endTime) {
      alert("Nom, date, heure de début et de fin sont obligatoires.");
      return;
    }

    setSaving(true);

    const start = `${date}T${startTime}:00`;
    const end = `${date}T${endTime}:00`;

    const { error: insertError } = await supabase.from("activities").insert([
      {
        camp_id: campId,
        name,
        relation_activity: relationActivity || null,
        category: category || null,
        start_time: start,
        end_time: end,
        location: location || null,
        responsable: responsable || null,
        description: description || null,
        materials: materials || null,
      },
    ]);

    if (insertError) {
      console.error("Erreur création activité depuis Picasso :", insertError);
      alert("Erreur lors de la création de l’activité.");
      setSaving(false);
      return;
    }

    // On prévient le parent de recharger la liste
    if (onCreated) {
      await onCreated();
    }

    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-[90%] shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Nouvelle activité
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nom de l’activité
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Date
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md p-2"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Début
              </label>
              <TimePicker15
                id="startTime"
                value={startTime}
                onChange={setStartTime}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Fin
              </label>
              <TimePicker15
                id="startTime"
                value={endTime}
                onChange={setEndTime}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Relation éducative
              </label>
              <input
                type="text"
                placeholder="Au corps, à l’environnement…"
                className="w-full border border-gray-300 rounded-md p-2"
                value={relationActivity}
                onChange={(e) => setRelationActivity(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Catégorie (SC, AC, AA…)
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 min-h-[60px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Matériel
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 min-h-[60px]"
              value={materials}
              onChange={(e) => setMaterial(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={saving}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : "Créer l’activité"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
