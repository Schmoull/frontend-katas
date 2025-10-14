import CampLayout from "../layouts/CampLayout";

export default function CampActivites() {
  return (
    <CampLayout>
      <section className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Activités du camp</h1>
        <p className="text-gray-600">
          Cette section contiendra la liste et la création des activités prévues pendant le camp.
        </p>
      </section>
    </CampLayout>
  );
}
