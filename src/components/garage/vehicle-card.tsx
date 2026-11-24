"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { deleteVehicle } from "@/actions/vehicles";
import { VehicleBuildSummary } from "@/components/garage/vehicle-build-summary";
import { EditVehicleModal } from "@/components/garage/edit-vehicle-modal";
import { VehicleImagePlaceholder } from "@/components/garage/vehicle-image-placeholder";
import type { Vehicle } from "@/types/database";
import type { GarageModSummary } from "@/types/garage";

interface VehicleCardProps {
  vehicle: Vehicle;
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
  const specs = [
    vehicle.year,
    vehicle.make,
    vehicle.model,
    vehicle.trim,
  ].filter(Boolean);
  const title =
    vehicle.nickname ||
    [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ") ||
    "Vehicle profile";

  return (
    <>
      <article className="vehicle-panel">
        <VehicleImagePlaceholder vehicleName={title} />

        <div className="vehicle-panel__content">
          <div className="vehicle-panel__identity">
            <div className="flex items-center justify-between gap-3">
              <p className="technical-label">Vehicle / profile</p>
              <span className="vehicle-panel__year">
                {vehicle.year ?? "YEAR —"}
              </span>
            </div>
            <h2 className="vehicle-panel__name">
              <Link
                href={`/garage/${vehicle.id}`}
                className="transition hover:text-accent"
              >
                {title}
              </Link>
            </h2>
            <p className="vehicle-panel__specs">
              {vehicle.nickname
                ? specs.join(" ") || "Vehicle specifications not set"
                : vehicle.trim || "Vehicle build profile"}
            </p>
            <p className="vehicle-panel__vin">
              <span className="technical-label">VIN / </span>
              {vehicle.vin ?? "Not provided"}
            </p>
          </div>

          <VehicleBuildSummary summary={summary} error={summaryError} />

          <div className="vehicle-panel__actions">
            <Link
              href={`/garage/${vehicle.id}`}
              className="button-primary vehicle-panel__open-build"
            >
              Open Build <span aria-hidden="true">→</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              aria-label={`Edit ${title}`}
              className="button-secondary"
            >
              Edit Vehicle
            </button>
            <form action={formAction} onSubmit={onBeforeDelete}>
              <input type="hidden" name="vehicleId" value={vehicle.id} />
              <button
                type="submit"
                disabled={isPending}
                aria-label={`Remove ${title} from garage`}
                className="vehicle-panel__delete disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "Removing..." : "Remove"}
              </button>
            </form>
          </div>
          {state && !state.success && (
            <p role="alert" className="state-message" data-tone="error">
              {state.error}
            </p>
          )}
        </div>
      </article>
      {isEditing && (
        <EditVehicleModal
          vehicle={vehicle}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
}
