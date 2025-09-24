import Button from "./components/Button";

export default function App() {
  return (
    <main className="min-h-screen grid place-items-center bg-gray-100 text-gray-900">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">Composant Button</h1>

        <Button onClick={() => alert("Tu as cliqué !")}>
          Cliquer
        </Button>

        <Button disabled>
          Désactivé
        </Button>
      </div>
    </main>
  );
}