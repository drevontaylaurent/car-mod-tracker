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
        <div className="open-build__diagnostic-code">
          <strong>{diagnostic.code}</strong>
          <span
            className="open-build__diagnostic-severity"
            data-severity={diagnostic.severity}
            data-status={diagnostic.status}
          >
            {severityLabel}
          </span>
          <span
            className="open-build__diagnostic-status"
            data-status={diagnostic.status}
          >
            {statusLabel}
          </span>
        </div>
        {diagnostic.status === "resolved" && diagnostic.resolved_at && (
          <p className="open-build__diagnostic-resolved">
            Marked fixed by the vehicle owner ·{" "}
            <time dateTime={diagnostic.resolved_at}>
              {diagnostic.resolved_at.slice(0, 10)}
            </time>
          </p>
        )}
        {diagnostic.notes && (
          <p className="open-build__diagnostic-notes">{diagnostic.notes}</p>
        )}
      </div>
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
    </li>
  );
}
