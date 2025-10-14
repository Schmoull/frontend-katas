import { useNavigate, useParams } from "react-router-dom";
import CampLayout from "../layouts/CampLayout";

export default function CampSettings() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleDelete = () => {
    if (!id) return;

    const confirmation = confirm(
      "⚠️ Es-tu sûr de vouloir supprimer définitivement ce camp ? Cette action est irréversible."
    );
    if (!confirmation) return;

    // Supprimer le camp du localStorage
    const storedCamps = JSON.parse(localStorage.getItem("camps") || "[]");
    const updatedCamps = storedCamps.filter((c: any) => c.id !== Number(id));
    localStorage.setItem("camps", JSON.stringify(updatedCamps));

    alert("Le camp a été supprimé avec succès.");
    navigate("/home");
  };

  return (
    <CampLayout>
      <section className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Paramètres du camp
        </h1>
        <p className="text-gray-600 mb-6">
          Cette section te permet de gérer les options avancées du camp.
        </p>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-red-700 mb-2">
            Danger zone
          </h2>
          <p className="text-gray-600 mb-4">
            Supprime définitivement ce camp et toutes ses données associées.
          </p>

          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition font-semibold"
          >
            Supprimer définitivement ce camp
          </button>
        </div>
      </section>
    </CampLayout>
  );
}
