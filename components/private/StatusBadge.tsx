export type StatusTone = "success" | "warning" | "danger" | "neutral";

const SUCCESS_STATUSES = new Set([
  "active",
  "completed",
  "done",
  "approved",
  "accepted",
  "delivered",
  "issued",
  "compliance_ok",
  "published",
  "closed",
  "answered",
]);

const DANGER_STATUSES = new Set([
  "rejected",
  "banned",
  "suspended",
  "failed",
  "terminated",
  "refunded",
  "rokhas_rejected",
  "withdrawn",
  "revised",
  "archived",
]);

/** Maps any status value from the schema's various CHECK-constrained columns
 * to a semantic tone, so every table in the admin uses the same badge
 * system regardless of which table's status vocabulary it is. */
export function statusTone(status: string): StatusTone {
  const key = status.toLowerCase();
  if (SUCCESS_STATUSES.has(key)) return "success";
  if (DANGER_STATUSES.has(key)) return "danger";
  return "warning";
}

const TONE_CLASSES: Record<StatusTone, string> = {
  success: "bg-success-bg text-success-fg",
  warning: "bg-warning-bg text-warning-fg",
  danger: "bg-danger-bg text-danger-fg",
  neutral: "bg-line/50 text-muted",
};

export function StatusBadge({ label, tone }: { label: string; tone: StatusTone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${TONE_CLASSES[tone]}`}
    >
      {label}
    </span>
  );
}
