import { STATUS_LABELS, type ActivityStatus } from "../types";

const STATUS_CLASSES: Record<ActivityStatus, string> = {
  draft: "bg-amber-100 text-amber-800",
  published: "bg-green-100 text-green-800",
  archived: "bg-gray-200 text-gray-700",
};

export default function StatusBadge({ status }: { status: string }) {
  const s = status as ActivityStatus;
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[s]}`}
    >
      {STATUS_LABELS[s]}
    </span>
  );
}
