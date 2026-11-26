import { DiagnosticTrackerHeader } from "@/components/diagnostics/diagnostic-tracker-header";
import { DiagnosticRow } from "@/components/diagnostics/diagnostic-row";
import { getDiagnosticSummary } from "@/lib/diagnostic-summary";
import type { VehicleDiagnostic } from "@/types/diagnostics";

interface VehicleDiagnosticTrackerProps {
  vehicleId: string;
  diagnostics: VehicleDiagnostic[] | null;
  loadError: string | null;
}

export function VehicleDiagnosticTracker({
  vehicleId,
  diagnostics,
  loadError,
}: VehicleDiagnosticTrackerProps) {
  const summary = diagnostics ? getDiagnosticSummary(diagnostics) : null;

  return (
    <section
      className="open-build__diagnostics"
      aria-labelledby="diagnostic-tracker-heading"
    >
      <DiagnosticTrackerHeader
        vehicleId={vehicleId}
        canAdd={Boolean(diagnostics && summary && !loadError)}
      />

      {loadError || !diagnostics || !summary ? (
        <p role="alert" className="open-build__diagnostic-load-error">
          {loadError ??
            "Diagnostic records are unavailable. Refresh the page and try again."}
        </p>
      ) : (
        <>
          <section
            className="open-build__diagnostic-progress"
            aria-label="Diagnostic fixed progress"
          >
            <div className="open-build__diagnostic-progress-copy">
              <span>
                {summary.resolutionPercent}% Resolved — {summary.resolvedCount}{" "}
                of {summary.totalCount} codes fixed
              </span>
              <strong>{summary.resolutionPercent}%</strong>
            </div>
            <progress
              max={100}
              value={summary.resolutionPercent}
              aria-label={`${summary.resolutionPercent}% of diagnostic codes marked fixed`}
            />
          </section>

          {diagnostics.length === 0 ? (
            <p role="status" className="open-build__diagnostic-empty">
              No diagnostic codes are recorded for this vehicle.
            </p>
          ) : (
            <ul className="open-build__diagnostic-list" aria-label="Vehicle diagnostic records">
              {diagnostics.map((diagnostic) => (
                <DiagnosticRow
                  key={diagnostic.id}
                  vehicleId={vehicleId}
                  diagnostic={diagnostic}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
