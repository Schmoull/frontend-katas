// src/pages/Login.tsx
import { useState } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/useAuth";
import type { FormEvent } from "react";

export default function Login() {
  const location = useLocation();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Page demandée avant la redirection vers /login (cf. ProtectedRoute)
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  // Déjà connecté (ou connexion réussie) → redirection
  if (user) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      console.error("Erreur login Supabase :", error);
      setErrorMsg(error.message || "Connexion impossible.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Connexion</h1>

        {errorMsg && <p className="mb-4 text-sm text-red-600">{errorMsg}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full border border-gray-300 rounded-md p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="password"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              className="w-full border border-gray-300 rounded-md p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          Pas encore de compte ?{" "}
          <Link to="/register" className="text-indigo-600 hover:underline">
            Créer un compte
          </Link>
        </p>
        <p className="mt-2 text-sm text-gray-600">
          <Link to="/" className="text-indigo-600 hover:underline">
            ← Parcourir le catalogue sans compte
          </Link>
        </p>
      </div>
    </main>
  );
}
