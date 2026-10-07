// src/routes/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import type { Role } from "../types";

type Props = {
  children: React.ReactNode;
  // Rôle minimum requis (par défaut : être connecté suffit)
  minRole?: Role;
};

export default function ProtectedRoute({ children, minRole }: Props) {
  const { user, loading, hasRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p className="p-4 text-gray-600">Vérification de la session…</p>;
  }

  if (!user) {
    // On garde la page demandée pour y revenir après connexion
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (minRole && !hasRole(minRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
