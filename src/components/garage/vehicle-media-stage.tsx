"use client";

import type { ReactNode } from "react";
import { VehicleVisual } from "@/components/garage/vehicle-visual";
import type { ModCategory } from "@/types/database";

export type VehicleBuildTab = "profile" | "build" | "parts";

interface VehicleMediaStageProps {
  vehicleName: string;
  activeTab: VehicleBuildTab;
  selectedSystem: ModCategory | null;
  photoUrl: string | null;
  visual?: ReactNode;
}

export function VehicleMediaStage({
  vehicleName,
  activeTab,
  selectedSystem,
  photoUrl,
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
          <VehicleVisual
            vehicleName={vehicleName}
            photoUrl={photoUrl}
            variant="build"
          />
        )}
      </div>
      <figcaption className="build-stage__caption">
        <span className="technical-label">Vehicle visual system / 01</span>
        <span>{vehicleName}</span>
      </figcaption>
    </figure>
  );
}
