"use client";

import { useState } from "react";
import { EditVehicleModal } from "@/components/garage/edit-vehicle-modal";
import { getDiagnosticSummary } from "@/lib/diagnostic-summary";
import type { VehicleDiagnostic } from "@/types/diagnostics";
import type { VehicleWithMedia } from "@/types/vehicle-media";

interface VehicleProfilePanelProps {
  vehicle: VehicleWithMedia;
  diagnostics: VehicleDiagnostic[] | null;
  diagnosticsError: string | null;
}

export function VehicleProfilePanel({
  vehicle,
  diagnostics,
  diagnosticsError,
}: VehicleProfilePanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const diagnosticSummary = diagnostics
    ? getDiagnosticSummary(diagnostics)
    : null;
  const highestSeverity =
    diagnosticSummary?.highestUnresolvedSeverity ?? null;
  const diagnosticState = diagnosticsError || !diagnosticSummary
    ? "TRACKER UNAVAILABLE"
    : diagnosticSummary?.unresolvedCount === 0
      ? "NO ACTIVE CODES"
      : `${diagnosticSummary?.unresolvedCount} UNRESOLVED · ${highestSeverity?.toUpperCase()}`;
  const diagnosticLabel =
    diagnosticsError || !diagnosticSummary
      ? diagnosticsError ?? "Diagnostic tracker unavailable."
      : diagnosticSummary.unresolvedCount === 0
      ? "No active diagnostic records in the tracker; this is not a vehicle-health assessment."
      : highestSeverity
        ? `${diagnosticSummary.unresolvedCount} unresolved diagnostic records. Highest severity: ${highestSeverity}.`
        : "Unresolved diagnostic records are present.";

  return (
    <>
      <section className="open-build__profile" aria-label="Vehicle details">
        <div className="open-build__profile-tools">
          <details className="open-build__specs">
            <summary className="open-build__specs-trigger">
              <span>SPECS &amp; VIN</span>
              <span className="open-build__specs-indicator" aria-hidden="true">
                +
              </span>
            </summary>
            <dl className="open-build__spec-grid">
              <Specification label="Year" value={vehicle.year?.toString()} />
              <Specification label="Make" value={vehicle.make} />
              <Specification label="Model" value={vehicle.model} />
              <Specification label="Trim" value={vehicle.trim} />
              <Specification label="VIN" value={vehicle.vin} />
            </dl>
          </details>
          <div
            className="open-build__obd-status"
            data-state={
              diagnosticsError || !diagnosticSummary
                ? "unavailable"
                : diagnosticSummary?.unresolvedCount
                  ? "active"
                  : "none"
            }
            data-severity={highestSeverity ?? "none"}
            aria-label={diagnosticLabel}
          >
            <span>OBD-II</span>
            <span className="open-build__obd-divider" aria-hidden="true">
              /
            </span>
            <span className="open-build__obd-state">{diagnosticState}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="button-secondary open-build__edit-vehicle"
        >
          EDIT VEHICLE
        </button>
      </section>
      {isEditing && (
        <EditVehicleModal
          vehicle={vehicle}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
}

function Specification({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <dt className="open-build__spec-label">{label}</dt>
      <dd className="open-build__spec-value">{value || "Not provided"}</dd>
    </div>
  );
}
