import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import Card from "../components/Card";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

type Camp = {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  groupe: string;
  unite:  string;
  responsable: string;
  location: string;
  theme: string;
  description: string;
  owner_id?: string | null;
};

export default function Home() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Charger les camps depuis Supabase
  useEffect(() => {
    async function fetchCamps() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("camps")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("❌ Erreur lors du chargement :", error);
        setError("Impossible de charger les camps pour le moment.");
      } else {
        setCamps(data || []);
      }

      setLoading(false);
    }

    fetchCamps();
  }, []);

  return (
    <MainLayout>
      <section>
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mes camps</h1>
        </header>

        {loading ? (
          <p className="text-gray-600">Chargement…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : camps.length === 0 ? (
          <p className="text-gray-600">Aucun camp pour le moment.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {camps.map((camp) => (
              <Card
                key={camp.id}
                title={camp.name}
                infoDate={`Débute le : ${camp.start_date}`}
                description={camp.description}
                imageSrc="/assets/img/default-camp.png"
                imageAlt={`Image du camp ${camp.name}`}
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
