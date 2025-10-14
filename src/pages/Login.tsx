import { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Page de connexion :
 * - utilisation de `useState` pour suivre les valeurs des champs
 * - `useNavigate` pour rediriger après connexion
 */
export default function Login() {
  // 1️⃣ États pour stocker ce que l’utilisateur tape
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 2️⃣ Outil de navigation React Router
  const navigate = useNavigate();

  // 3️⃣ Fonction exécutée quand on clique sur "Se connecter"
  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault(); // empêche le rechargement automatique du formulaire

    // Simulation d'une vérification de login (fake)
    if (email === "test@scout.ch" && password === "1234") {
      // Enregistre une "session" fictive dans le localStorage
      localStorage.setItem("user", JSON.stringify({ email }));

      // Redirige vers la page d'accueil
      navigate("/home");
    } else {
      alert("Identifiants incorrects");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-300 text-gray-900">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Connexion</h1>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            Adresse e-mail
          </label>
          <input
            id="email"
            type="email"
            className="w-full rounded-md border border-gray-300 p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ex: test@scout.ch"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            className="w-full rounded-md border border-gray-300 p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white rounded-md p-2 font-semibold hover:bg-indigo-700 transition"
        >
          Se connecter
        </button>
      </form>
    </main>
  );
}
