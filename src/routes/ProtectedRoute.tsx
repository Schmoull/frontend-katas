// src/routes/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="p-4 text-gray-600">Vérification de la session…</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}