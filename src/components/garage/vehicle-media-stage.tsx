"use client";

import type { ReactNode } from "react";
import { VehicleVisual } from "@/components/garage/vehicle-visual";

interface VehicleMediaStageProps {
  vehicleName: string;
  photoUrl: string | null;
  visual?: ReactNode;
}

export function VehicleMediaStage({
  vehicleName,
  photoUrl,
  visual,
}: VehicleMediaStageProps) {
  return (
    <figure
      className="open-build__visual"
      aria-label={`Vehicle visual for ${vehicleName}`}
    >
      <div className="open-build__visual-frame" data-vehicle-media-stage>
        {visual ?? (
          <VehicleVisual
            vehicleName={vehicleName}
            photoUrl={photoUrl}
            variant="build"
          />
        )}
      </div>
      <figcaption className="open-build__visual-caption">
        Owner photo when available · illustrative fallback otherwise
      </figcaption>
    </figure>
  );
}
