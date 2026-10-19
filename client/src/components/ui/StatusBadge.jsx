
import { CheckCircle2, CircleDot } from "lucide-react";
import { STATUS_STYLES } from "../../lib/statusStyles";

export default function StatusBadge({ status = "Reported" }) {
  const styles = STATUS_STYLES[status] ?? STATUS_STYLES.Reported;
  const Icon = status === "Resolved" || status === "Closed"
    ? CheckCircle2
    : CircleDot;

  return (
    <span
      className={`inline-flex min-h-6 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styles}`}
    >
      <Icon size={14} aria-hidden="true" />
      {status}
    </span>
  );
}
