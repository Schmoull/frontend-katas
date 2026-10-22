import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/useAuth";

export default function LogoutButton() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition font-semibold"
    >
      {t("nav.logout")}
    </button>
  );
}
