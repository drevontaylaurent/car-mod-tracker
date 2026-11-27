import { DiagnosticRowControls } from "@/components/diagnostics/diagnostic-row-controls";
import type { VehicleDiagnostic } from "@/types/diagnostics";

interface DiagnosticRowProps {
  vehicleId: string;
  diagnostic: VehicleDiagnostic;
}

export function DiagnosticRow({
  vehicleId,
  diagnostic,
}: DiagnosticRowProps) {
  const severityLabel =
    diagnostic.severity[0].toUpperCase() + diagnostic.severity.slice(1);
  const statusLabel =
    diagnostic.status === "resolved"
      ? "Fixed"
      : diagnostic.status[0].toUpperCase() + diagnostic.status.slice(1);

  return (
    <li className="open-build__diagnostic-row">
      <div className="open-build__diagnostic-main">
        <strong
          className="open-build__diagnostic-code"
          data-severity={diagnostic.severity}
          data-status={diagnostic.status}
        >
          {diagnostic.code}
        </strong>
        <span className="open-build__diagnostic-notes">
          {diagnostic.notes ? `${statusLabel} · ${diagnostic.notes}` : statusLabel}
        </span>
        <span
          className="open-build__diagnostic-severity"
          data-severity={diagnostic.severity}
          data-status={diagnostic.status}
        >
          {diagnostic.status === "resolved" ? "Fixed" : severityLabel}
        </span>
        <DiagnosticRowControls vehicleId={vehicleId} diagnostic={diagnostic} />
      </div>
      {diagnostic.status === "resolved" && diagnostic.resolved_at && (
        <div className="open-build__diagnostic-fixed-meta">
          <strong className="open-build__diagnostic-fixed-label">
            <span aria-hidden="true">✓</span> MARKED FIXED
          </strong>
          <span className="open-build__diagnostic-fixed-date">
            <span className="open-build__diagnostic-fixed-date-label">
              FIXED DATE
            </span>
            <time dateTime={diagnostic.resolved_at}>
              {diagnostic.resolved_at.slice(0, 10)}
            </time>
          </span>
        </div>
      )}
    </li>
  );
}
