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
      type="button"
      onClick={handleLogout}
      className="btn btn-contour btn-petit"
    >
      {t("nav.logout")}
    </button>
  );
}
