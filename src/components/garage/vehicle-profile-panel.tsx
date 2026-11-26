"use client";

import { useCallback, useState } from "react";
import { EditVehicleModal } from "@/components/garage/edit-vehicle-modal";
import { VehicleSpecsSheet } from "@/components/garage/vehicle-specs-sheet";
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
  const [panel, setPanel] = useState<"closed" | "specs" | "edit">("closed");
  const closePanel = useCallback(() => setPanel("closed"), []);

  return (
    <>
      <section className="open-build__profile" aria-label="Vehicle details">
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setPanel("specs")}
          className="open-build__chip open-build__specs-trigger"
        >
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
        </button>
        <VehicleObdChip
          diagnostics={diagnostics}
          diagnosticsError={diagnosticsError}
          onOpenDiagnostics={onOpenDiagnostics}
        />
      </section>
      {panel === "specs" && (
        <VehicleSpecsSheet
          vehicle={vehicle}
          onClose={closePanel}
          onEdit={() => setPanel("edit")}
        />
      )}
      {panel === "edit" && (
        <EditVehicleModal vehicle={vehicle} onClose={closePanel} />
      )}
    </>
  );
}
