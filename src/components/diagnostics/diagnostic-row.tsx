import { DiagnosticEditForm } from "@/components/diagnostics/diagnostic-edit-form";
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
          {diagnostic.notes ?? statusLabel}
        </span>
        <span
          className="open-build__diagnostic-severity"
          data-severity={diagnostic.severity}
          data-status={diagnostic.status}
        >
          {diagnostic.status === "resolved" ? "Fixed" : severityLabel}
        </span>
      </div>
      <details className="open-build__diagnostic-manage">
        <summary>
          Manage
          <span className="sr-only"> {diagnostic.code}</span>
          {diagnostic.status !== "resolved" && (
            <span className="open-build__diagnostic-state"> · {statusLabel}</span>
          )}
        </summary>
        {diagnostic.status === "resolved" && diagnostic.resolved_at && (
          <p className="open-build__diagnostic-resolved">
            Marked fixed by the vehicle owner ·{" "}
            <time dateTime={diagnostic.resolved_at}>
              {diagnostic.resolved_at.slice(0, 10)}
            </time>
          </p>
        )}
        <div className="open-build__diagnostic-actions">
          <DiagnosticRowControls vehicleId={vehicleId} diagnostic={diagnostic} />
          <details className="open-build__diagnostic-details">
            <summary>Edit details</summary>
            <DiagnosticEditForm
              vehicleId={vehicleId}
              diagnostic={diagnostic}
            />
          </details>
        </div>
      </details>
    </li>
  );
}
