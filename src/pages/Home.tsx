import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import Card from "../components/Card";
import { Link } from "react-router-dom";

type Camp = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  groupe: string;
  unite: string;
  responsable: string;
  location: string;
  theme: string;
  description: string;
};

export default function Home() {
  const [camps, setCamps] = useState<Camp[]>([]);

  // 🔹 Charger les camps depuis le localStorage au démarrage
  useEffect(() => {
    const storedCamps = JSON.parse(localStorage.getItem("camps") || "[]");
    setCamps(storedCamps);
  }, []);

  return (
    <MainLayout>
      <section>
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mes camps</h1>
        </header>

        {/* Si aucun camp */}
        {camps.length === 0 ? (
          <p className="text-gray-600">
            Aucun camp pour le moment. Crée ton premier camp via le menu à
            gauche.
          </p>
        ) : (
          // 🔹 Liste des camps en cartes
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {camps.map((camp) => (
              <Card
                key={camp.id}
                title={camp.name}
                infoDate={"Débute le : " + camp.startDate}
                description={camp.description}
                imageSrc="/assets/img/default-camp.png"
                imageAlt="Image par défaut d’un camp"
                actions={
                  <>
                    <Link
                      to={`/camp/${camp.id}`}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                    >
                      Détails
                    </Link>
                  </>
                }
              />
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  );
}
