"use client";

import type { ReactNode } from "react";
import { VehicleImagePlaceholder } from "@/components/garage/vehicle-image-placeholder";
import type { ModCategory } from "@/types/database";

export type VehicleBuildTab = "profile" | "build" | "parts" | "add";

interface VehicleMediaStageProps {
  vehicleName: string;
  activeTab: VehicleBuildTab;
  selectedSystem: ModCategory | null;
  visual?: ReactNode;
}

export function VehicleMediaStage({
  vehicleName,
  activeTab,
  selectedSystem,
  visual,
}: VehicleMediaStageProps) {
  return (
    <figure
      className="build-stage"
      aria-label={`Vehicle visual for ${vehicleName}`}
      data-active-panel={activeTab}
      data-selected-system={selectedSystem ?? "all"}
    >
      <div className="build-stage__viewport" data-vehicle-media-stage>
        {visual ?? (
          <VehicleImagePlaceholder vehicleName={vehicleName} variant="build" />
        )}
      </div>
      <figcaption className="build-stage__caption">
        <span className="technical-label">Vehicle visual system / 01</span>
        <span>{vehicleName}</span>
      </figcaption>
    </figure>
  );
}
