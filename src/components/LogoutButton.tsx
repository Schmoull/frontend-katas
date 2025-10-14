import { useNavigate } from "react-router-dom";

/**
 * Bouton de déconnexion :
 * - supprime l'utilisateur stocké dans le localStorage
 * - redirige vers la page de connexion
 */
export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition font-semibold"
    >
      Se déconnecter
    </button>
  );
}
