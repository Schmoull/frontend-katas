import { useTranslation } from "react-i18next";
import type { ActivityStatus } from "../types";

// Brouillon : cadre pointillé (pas encore « posé ») ; publiée : sapin (réussite) ;
// archivée : en retrait.
const STATUS_CLASSES: Record<ActivityStatus, string> = {
  draft: "border-2 border-dashed border-encre bg-papier-clair text-encre",
  published: "border-2 border-sapin bg-sapin text-blanc",
  archived: "border-2 border-papier-fonce bg-papier-fonce text-encre-douce",
};

export default function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const s = status as ActivityStatus;
  return (
    <span
      className={`inline-flex h-7 items-center px-2 font-titre text-sm font-bold uppercase tracking-wider ${STATUS_CLASSES[s]}`}
    >
      {t(`statuses.${s}`)}
    </span>
  );
}
