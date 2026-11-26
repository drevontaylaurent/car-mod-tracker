"use client";

import { useState } from "react";
import { EditVehicleModal } from "@/components/garage/edit-vehicle-modal";
import { VehicleObdChip } from "@/components/garage/vehicle-obd-chip";
import type { VehicleDiagnostic } from "@/types/diagnostics";
import type { VehicleWithMedia } from "@/types/vehicle-media";

interface VehicleProfilePanelProps {
  vehicle: VehicleWithMedia;
  diagnostics: VehicleDiagnostic[] | null;
  diagnosticsError: string | null;
  onOpenDiagnostics: () => void;
}

export function VehicleProfilePanel({
  vehicle,
  diagnostics,
  diagnosticsError,
  onOpenDiagnostics,
}: VehicleProfilePanelProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <section className="open-build__profile" aria-label="Vehicle details">
        <details className="open-build__specs">
          <summary className="open-build__chip open-build__specs-trigger">
            <svg
              className="open-build__chip-icon"
              viewBox="0 0 16 16"
              aria-hidden="true"
            >
              <path
                d="M4 1.75h5.5L13 5.25v9H4zM9.5 1.75v3.5H13M6 8.5h5M6 11h5"
                fill="none"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="1.2"
              />
            </svg>
            <span>Specs &amp; VIN</span>
          </summary>
          <dl className="open-build__spec-grid">
            <Specification label="Year" value={vehicle.year?.toString()} />
            <Specification label="Make" value={vehicle.make} />
            <Specification label="Model" value={vehicle.model} />
            <Specification label="Trim" value={vehicle.trim} />
            <Specification label="VIN" value={vehicle.vin} />
          </dl>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="button-secondary open-build__edit-vehicle"
          >
            EDIT VEHICLE
          </button>
        </details>
        <VehicleObdChip
          diagnostics={diagnostics}
          diagnosticsError={diagnosticsError}
          onOpenDiagnostics={onOpenDiagnostics}
        />
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
