import { Navigate } from "react-router-dom";
import React from "react";


/**
 * Ce composant agit comme une "porte d'entrée" :
 * - il vérifie si un utilisateur est connecté (dans localStorage)
 * - s'il ne l'est pas, il redirige vers /login
 * - sinon, il affiche la page demandée
 */
type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = localStorage.getItem("user");

  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
}
