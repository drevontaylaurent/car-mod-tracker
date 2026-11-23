export type StatusBadgeStatus =
  | "Installed"
  | "Ordered"
  | "Wishlist"
  | "Healthy"
  | "Resolved"
  | "Pending"
  | "Attention"
  | "Active"
  | "Critical"
  | "Neutral";

interface StatusBadgeProps {
  status: StatusBadgeStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className="status-badge" data-status={status}>
      <span className="status-indicator" aria-hidden="true" />
      {status}
    </span>
  );
}
