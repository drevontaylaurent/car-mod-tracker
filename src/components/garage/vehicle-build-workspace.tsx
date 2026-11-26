"use client";

import { useCallback, useState } from "react";
import { AddModDialog } from "@/components/mods/add-mod-dialog";
import { ModList } from "@/components/mods/mod-list";
import { BuildSummary } from "@/components/mods/build-summary";
import {
  BuildSectionNavigation,
  type ActiveBuildSection,
} from "@/components/garage/build-section-navigation";
import { VehicleMediaStage } from "@/components/garage/vehicle-media-stage";
import { VehicleProfilePanel } from "@/components/garage/vehicle-profile-panel";
import { VehicleDiagnosticTracker } from "@/components/diagnostics/vehicle-diagnostic-tracker";
import { BuildTimeline } from "@/components/timeline/build-timeline";
import type { BuildPhase } from "@/types/build-timeline";
import type { Mod, ModStatus } from "@/types/database";
import type { VehicleDiagnostic } from "@/types/diagnostics";
import type { VehicleWithMedia } from "@/types/vehicle-media";

interface VehicleBuildWorkspaceProps {
  vehicle: VehicleWithMedia;
  mods: Mod[];
  diagnostics: VehicleDiagnostic[] | null;
  diagnosticsError: string | null;
  phases: BuildPhase[] | null;
  timelineError: string | null;
}

export function VehicleBuildWorkspace({
  vehicle,
  mods,
  diagnostics,
  diagnosticsError,
  phases,
  timelineError,
}: VehicleBuildWorkspaceProps) {
  const [isAddModOpen, setIsAddModOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ModStatus | null>(null);
  const [activeSection, setActiveSection] =
    useState<ActiveBuildSection>("inventory");
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
    <section
      className="build-experience"
      aria-label={`Build experience for ${vehicleName}`}
    >
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
          <VehicleProfilePanel
            vehicle={vehicle}
            diagnostics={diagnostics}
            diagnosticsError={diagnosticsError}
          />
        </div>
      </div>

      <BuildSummary
        mods={mods}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <BuildSectionNavigation
        vehicleId={vehicle.id}
        activeSection={activeSection}
        onActiveSectionChange={setActiveSection}
      />

      <section
        id={`build-${vehicle.id}-inventory-panel`}
        className="open-build__tab-panel"
        role="tabpanel"
        aria-labelledby={`build-${vehicle.id}-inventory-tab`}
        tabIndex={0}
        hidden={activeSection !== "inventory"}
      >
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
          <ModList mods={mods} statusFilter={statusFilter} />
        </section>
      </section>

      <section
        id={`build-${vehicle.id}-diagnostics-panel`}
        className="open-build__tab-panel"
        role="tabpanel"
        aria-labelledby={`build-${vehicle.id}-diagnostics-tab`}
        tabIndex={0}
        hidden={activeSection !== "diagnostics"}
      >
        <VehicleDiagnosticTracker
          vehicleId={vehicle.id}
          diagnostics={diagnostics}
          loadError={diagnosticsError}
        />
      </section>

      <section
        id={`build-${vehicle.id}-timeline-panel`}
        className="open-build__tab-panel"
        role="tabpanel"
        aria-labelledby={`build-${vehicle.id}-timeline-tab`}
        tabIndex={0}
        hidden={activeSection !== "timeline"}
      >
        <BuildTimeline
          vehicleId={vehicle.id}
          phases={phases}
          mods={mods}
          loadError={timelineError}
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
