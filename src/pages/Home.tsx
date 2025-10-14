import LogoutButton from "../components/LogoutButton";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Page d’accueil : mes camps</h1>
        <LogoutButton />
      </header>

      <p>Liste de tes camps ici…</p>
    </main>
  );
}