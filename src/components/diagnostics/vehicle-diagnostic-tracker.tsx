import { CreateDiagnosticForm } from "@/components/diagnostics/create-diagnostic-form";
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
      <header className="open-build__diagnostic-heading">
        <div>
          <p className="technical-label">Manual records / vehicle-specific</p>
          <h2 id="diagnostic-tracker-heading">OBD-II Diagnostic Tracker</h2>
        </div>
        <span className="open-build__diagnostic-marker">MANUAL</span>
      </header>

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
              <span>FIXED PROGRESS</span>
              <strong>{summary.resolutionPercent}% FIXED</strong>
            </div>
            <progress
              max={100}
              value={summary.resolutionPercent}
              aria-label={`${summary.resolutionPercent}% of diagnostic codes marked fixed`}
            />
            <p>
              {summary.resolvedCount} of {summary.totalCount} codes marked fixed
            </p>
          </section>

          <CreateDiagnosticForm
            vehicleId={vehicleId}
          />
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
