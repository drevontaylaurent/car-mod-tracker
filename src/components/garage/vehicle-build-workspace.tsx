"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { ModList } from "@/components/mods/mod-list";
import type { Mod, ModCategory } from "@/types/database";
import { VehicleMediaStage, type VehicleBuildTab } from "@/components/garage/vehicle-media-stage";

interface VehicleBuildWorkspaceProps {
  vehicleId: string;
  vehicleName: string;
  mods: Mod[];
  profile: ReactNode;
  build: ReactNode;
  addMod: ReactNode;
}

const TABS: { id: VehicleBuildTab; label: string; mobileLabel: string }[] = [
  { id: "profile", label: "PROFILE", mobileLabel: "Profile" },
  { id: "build", label: "BUILD", mobileLabel: "Build" },
  { id: "parts", label: "PARTS", mobileLabel: "Parts" },
  { id: "add", label: "+ ADD MOD", mobileLabel: "+ Add" },
];

export function VehicleBuildWorkspace({
  vehicleId,
  vehicleName,
  mods,
  profile,
  build,
  addMod,
}: VehicleBuildWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<VehicleBuildTab>("profile");
  const [selectedSystem, setSelectedSystem] = useState<ModCategory | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const idPrefix = `vehicle-build-${vehicleId}`;
  const panels: Record<VehicleBuildTab, ReactNode> = {
    profile,
    build,
    parts: (
      <ModList
        mods={mods}
        onCategoryChange={setSelectedSystem}
      />
    ),
    add: addMod,
  };

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    let nextIndex: number | undefined;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % TABS.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = TABS.length - 1;
    }

    if (nextIndex === undefined) {
      return;
    }

    event.preventDefault();
    const nextTab = TABS[nextIndex];
    setActiveTab(nextTab.id);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <section className="build-experience" aria-label={`Build experience for ${vehicleName}`}>
      <h1 className="sr-only">Vehicle build: {vehicleName}</h1>
      <div className="build-tabs" role="tablist" aria-label="Vehicle build sections">
        {TABS.map((tab, index) => {
          const tabId = `${idPrefix}-tab-${tab.id}`;
          const panelId = `${idPrefix}-panel-${tab.id}`;
          const isSelected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              id={tabId}
              role="tab"
              aria-selected={isSelected}
              aria-controls={panelId}
              tabIndex={isSelected ? 0 : -1}
              className="build-tab"
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              <span className="build-tab__index" aria-hidden="true">
                0{index + 1}
              </span>
              <span className="build-tab__label--desktop">{tab.label}</span>
              <span className="build-tab__label--mobile">{tab.mobileLabel}</span>
            </button>
          );
        })}
      </div>

      <div
        className="build-experience__layout"
        data-active-tab={activeTab}
        data-selected-system={selectedSystem ?? "all"}
      >
        <div className="build-experience__stage">
          <VehicleMediaStage
            vehicleName={vehicleName}
            activeTab={activeTab}
            selectedSystem={selectedSystem}
          />
        </div>
        <div className="build-experience__panels">
          {TABS.map((tab) => {
            const tabId = `${idPrefix}-tab-${tab.id}`;
            const panelId = `${idPrefix}-panel-${tab.id}`;
            const isSelected = activeTab === tab.id;

            return (
              <section
                key={tab.id}
                id={panelId}
                role="tabpanel"
                aria-labelledby={tabId}
                tabIndex={isSelected ? 0 : -1}
                hidden={!isSelected}
                data-panel={tab.id}
                className="build-experience__panel"
              >
                {panels[tab.id]}
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
