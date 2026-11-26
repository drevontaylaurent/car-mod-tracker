"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { deleteVehicle } from "@/actions/vehicles";
import { EditVehicleModal } from "@/components/garage/edit-vehicle-modal";
import { VehicleBuildSummary } from "@/components/garage/vehicle-build-summary";
import { VehicleVisual } from "@/components/garage/vehicle-visual";
import type { GarageModSummary } from "@/types/garage";
import type { VehicleWithMedia } from "@/types/vehicle-media";

interface VehicleCardProps {
  vehicle: VehicleWithMedia;
  summary?: GarageModSummary;
  summaryError?: string;
  onBeforeDelete?: () => void;
}

export function VehicleCard({
  vehicle,
  summary,
  summaryError,
  onBeforeDelete,
}: VehicleCardProps) {
  const [state, formAction, isPending] = useActionState(deleteVehicle, undefined);
  const [isEditing, setIsEditing] = useState(false);
  const specs = [vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean);
  const title =
    vehicle.nickname ||
    [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ") ||
    "Vehicle profile";
  const installedCount = summary?.installedCount ?? 0;
  const totalModCount = summary?.totalModCount ?? 0;
  const buildStatus =
    installedCount === 0
      ? "Planning"
      : installedCount === totalModCount
        ? "Complete"
        : "In Progress";

  return (
    <>
      <article className="vehicle-hub-card">
        <div className="vehicle-hub-card__hero">
          <span className={`vehicle-hub-card__status vehicle-hub-card__status--${buildStatus.toLowerCase().replace(" ", "-")}`}>
            <span aria-hidden="true" />
            {buildStatus}
          </span>
          <Link href={`/garage/${vehicle.id}`} className="vehicle-hub-card__open">
            Open Build <span aria-hidden="true">→</span>
          </Link>
          <Link
            href={`/garage/${vehicle.id}`}
            className="vehicle-hub-card__visual-link"
            aria-label={`Open build for ${title}`}
          >
            <VehicleVisual vehicleName={title} photoUrl={vehicle.photoUrl} />
          </Link>
        </div>

        <div className="vehicle-hub-card__content">
          <div className="vehicle-hub-card__identity">
            <div>
              <h2>{title}</h2>
              <p>{specs.join(" ") || "Vehicle specifications not set"}</p>
            </div>
            <details className="vehicle-hub-card__manage">
              <summary aria-label={`Manage ${title}`}>
                <span>{String(totalModCount).padStart(2, "0")} mods</span>
                <span aria-hidden="true">•••</span>
              </summary>
              <div className="vehicle-hub-card__manage-menu">
                <button type="button" onClick={() => setIsEditing(true)}>
                  Edit Vehicle
                </button>
                <form action={formAction} onSubmit={onBeforeDelete}>
                  <input type="hidden" name="vehicleId" value={vehicle.id} />
                  <button type="submit" disabled={isPending}>
                    {isPending ? "Removing..." : "Remove"}
                  </button>
                </form>
              </div>
            </details>
          </div>

          <VehicleBuildSummary summary={summary} error={summaryError} />

          {state && !state.success && (
            <p role="alert" className="state-message" data-tone="error">
              {state.error}
            </p>
          )}
        </div>
      </article>
      {isEditing && (
        <EditVehicleModal vehicle={vehicle} onClose={() => setIsEditing(false)} />
      )}
    </>
  );
}
