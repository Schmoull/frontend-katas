import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import logo from "../assets/scoutoria/scoutoria-logo.svg";

// Pages de connexion : carte claire posée sur le relief
export default function AuthLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <main className="bandeau-relief min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md bg-papier-clair p-6 shadow-posee sm:p-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link to="/" className="shrink-0">
            <img src={logo} alt={t("app.name")} className="h-10 w-auto" />
          </Link>
          <LanguageSwitcher />
        </div>
        <h1 className="titre-2 mb-6">{title}</h1>
        {children}
      </div>
    </main>
  );
}
