// src/routes/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p className="p-4 text-gray-600">Vérification de la session…</p>;
  }

  if (!user) {
    // On garde la page demandée pour y revenir après connexion
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
