import { useState } from "react";
import Button from "./components/Button";
import Card from "./components/Card";

export default function App() {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <main className="min-h-screen grid place-items-center bg-gray-100 text-gray-900">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">Composant Button</h1>

        <Button onClick={handleClick} loading={loading}>
          {loading ? "Chargement..." : "Cliquer"}
        </Button>

        <Button disabled>
          Désactivé
        </Button>
      </div>

      <div className="mx-auto max-w-5xl p-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          title="Veste denim vintage"
          description="Coupe droite, années 90. Tissu épais, surpiqûres contrastées."
          imageSrc="https://images.unsplash.com/photo-1516826957135-700dedea698c?q=80&w=1200&auto=format&fit=crop"
          imageAlt="Veste en jean posée sur fond neutre"
          actions={
            <>
              <Button onClick={() => alert('Détails')}>Détails</Button>
              <Button disabled>Ajouter</Button>
            </>
          }
        />

        <Card
          title="Carte sans image"
          description="Exemple minimal : titre + description + (facultatif) actions."
          actions={<Button onClick={() => alert('OK')}>OK</Button>}
        />

        <Card
          title="Juste un titre"
          // description et actions omises volontairement
        />
      </div>
    </main>
  );
}