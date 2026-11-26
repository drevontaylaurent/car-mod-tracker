"use client";

import type { KeyboardEvent } from "react";

export type ActiveBuildSection = "inventory" | "diagnostics" | "timeline";

interface BuildSectionNavigationProps {
  vehicleId: string;
  activeSection: ActiveBuildSection;
  onActiveSectionChange: (section: ActiveBuildSection) => void;
}

const sections: readonly {
  id: ActiveBuildSection;
  label: string;
}[] = [
  { id: "inventory", label: "MOD INVENTORY" },
  { id: "diagnostics", label: "OBD-II" },
  { id: "timeline", label: "BUILD TIMELINE" },
];

const sectionIds: readonly ActiveBuildSection[] = [
  "inventory",
  "diagnostics",
  "timeline",
];

export function BuildSectionNavigation({
  vehicleId,
  activeSection,
  onActiveSectionChange,
}: BuildSectionNavigationProps) {
  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    current: ActiveBuildSection,
  ) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const currentIndex = sectionIds.indexOf(current);
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? sectionIds.length - 1
          : (currentIndex +
              (event.key === "ArrowRight" ? 1 : sectionIds.length - 1)) %
            sectionIds.length;
    const next = sectionIds[nextIndex];
    onActiveSectionChange(next);
    document.getElementById(`build-${vehicleId}-${next}-tab`)?.focus();
  }

  return (
    <div
      className="open-build__navigation"
      role="tablist"
      aria-label="Open Build sections"
    >
      {sections.map((section) => (
        <button
          key={section.id}
          type="button"
          id={`build-${vehicleId}-${section.id}-tab`}
          className="open-build__nav-item"
          role="tab"
          aria-selected={activeSection === section.id}
          aria-controls={`build-${vehicleId}-${section.id}-panel`}
          tabIndex={activeSection === section.id ? 0 : -1}
          onClick={() => onActiveSectionChange(section.id)}
          onKeyDown={(event) => handleKeyDown(event, section.id)}
        >
          <span>{section.label}</span>
          <span className="open-build__nav-state">
            {activeSection === section.id ? "ACTIVE" : "OPEN"}
          </span>
        </button>
      ))}
    </div>
  );
}
