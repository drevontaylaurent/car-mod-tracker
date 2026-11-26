"use client";

import { useCallback, useState } from "react";
import { AddModDialog } from "@/components/mods/add-mod-dialog";
import { ModList } from "@/components/mods/mod-list";
import { BuildSummary } from "@/components/mods/build-summary";
import { BuildSectionNavigation } from "@/components/garage/build-section-navigation";
import { VehicleMediaStage } from "@/components/garage/vehicle-media-stage";
import { VehicleProfilePanel } from "@/components/garage/vehicle-profile-panel";
import type { Mod, ModStatus } from "@/types/database";
import type { VehicleWithMedia } from "@/types/vehicle-media";

interface VehicleBuildWorkspaceProps {
  vehicle: VehicleWithMedia;
  mods: Mod[];
}

export function VehicleBuildWorkspace({
  vehicle,
  mods,
}: VehicleBuildWorkspaceProps) {
  const [isAddModOpen, setIsAddModOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ModStatus | null>(null);
  const vehicleName =
    vehicle.nickname ||
    [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ") ||
    "Vehicle build";
  const vehicleSpecifications = [
    vehicle.year?.toString(),
    vehicle.make,
    vehicle.model,
    vehicle.trim,
  ].filter(Boolean);
  const closeAddMod = useCallback(() => setIsAddModOpen(false), []);

  return (
    <section className="build-experience" aria-label={`Build experience for ${vehicleName}`}>
      <h1 className="sr-only">Vehicle build: {vehicleName}</h1>
      <div className="open-build__hero">
        <VehicleMediaStage
          vehicleName={vehicleName}
          photoUrl={vehicle.photoUrl}
        />
        <div className="open-build__identity">
          <p className="technical-label text-accent">Vehicle / Open build</p>
          <h2 className="open-build__title">{vehicleName}</h2>
          {vehicle.nickname && (
            <p className="open-build__specifications">
              {vehicleSpecifications.join(" / ") || "Vehicle specifications not set"}
            </p>
          )}
          {!vehicle.nickname && vehicle.trim && (
            <p className="open-build__specifications">Trim / {vehicle.trim}</p>
          )}
          <VehicleProfilePanel vehicle={vehicle} />
        </div>
      </div>

      <BuildSummary
        mods={mods}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <BuildSectionNavigation />

      <div className="open-build__actions">
        <button
          type="button"
          className="button-primary open-build__add-mod"
          aria-haspopup="dialog"
          aria-expanded={isAddModOpen}
          aria-controls={isAddModOpen ? "add-mod-dialog" : undefined}
          onClick={() => setIsAddModOpen(true)}
        >
          + ADD MOD
        </button>
      </div>

      <section
        id="open-build-mod-inventory"
        className="open-build__inventory"
        aria-labelledby="mod-list-heading"
      >
        <ModList
          mods={mods}
          statusFilter={statusFilter}
        />
      </section>

      {isAddModOpen && (
        <AddModDialog
          vehicleId={vehicle.id}
          onClose={closeAddMod}
        />
      )}
    </section>
  );
}
