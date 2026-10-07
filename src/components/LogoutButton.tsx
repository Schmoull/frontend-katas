import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

export default function LogoutButton() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
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
