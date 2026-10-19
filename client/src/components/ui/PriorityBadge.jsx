
import { PRIORITY_STYLES } from "../../lib/statusStyles";

export default function PriorityBadge({ priority = "Medium" }) {
  const styles = PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.Medium;

  return (
    <span
      className={`inline-flex min-h-6 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styles.badge}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
        aria-hidden="true"
      />
      {priority}
    </span>
  );
}
