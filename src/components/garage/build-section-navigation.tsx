"use client";

import type { KeyboardEvent } from "react";

export type ActiveBuildSection = "inventory" | "diagnostics";

interface BuildSectionNavigationProps {
  vehicleId: string;
  activeSection: ActiveBuildSection;
  onActiveSectionChange: (section: ActiveBuildSection) => void;
}

const sections = [
  { id: "inventory", label: "MOD INVENTORY", available: true },
  { id: "diagnostics", label: "OBD-II", available: true },
  { id: "timeline", label: "BUILD TIMELINE", available: false },
] as const;

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
    const next: ActiveBuildSection =
      event.key === "Home"
        ? "inventory"
        : event.key === "End"
          ? "diagnostics"
          : current === "inventory"
            ? "diagnostics"
            : "inventory";
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
          aria-controls={
            section.available
              ? `build-${vehicleId}-${section.id}-panel`
              : undefined
          }
          disabled={!section.available}
          tabIndex={
            section.available && activeSection === section.id ? 0 : -1
          }
          onClick={() => {
            if (section.available) {
              onActiveSectionChange(section.id);
            }
          }}
          onKeyDown={(event) => {
            if (section.available) {
              handleKeyDown(event, section.id);
            }
          }}
        >
          <span>{section.label}</span>
          {section.available ? (
            <span className="open-build__nav-state">
              {activeSection === section.id ? "ACTIVE" : "OPEN"}
            </span>
          ) : (
            <span className="open-build__nav-state">COMING SOON</span>
          )}
        </button>
      ))}
    </div>
  );
}
