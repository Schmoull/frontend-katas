import CampLayout from "../layouts/CampLayout";

export default function CampPlanning() {
  return (
    <CampLayout>
      <section className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Planning du camp</h1>
        <p className="text-gray-600">
          Cette section affichera le planning complet du camp : journées, horaires et activités.
        </p>
      </section>
    </CampLayout>
  );
}
