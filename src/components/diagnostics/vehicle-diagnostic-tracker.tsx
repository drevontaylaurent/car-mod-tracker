"use client";

import { useState } from "react";
import { DiagnosticTrackerHeader } from "@/components/diagnostics/diagnostic-tracker-header";
import { DiagnosticRow } from "@/components/diagnostics/diagnostic-row";
import type { VehicleDiagnostic } from "@/types/diagnostics";

type DiagnosticFilter = "all" | "critical" | "minor" | "fixed";
const DIAGNOSTIC_FILTERS: readonly DiagnosticFilter[] = [
  "all",
  "critical",
  "minor",
  "fixed",
];

const FILTER_LABELS: Record<DiagnosticFilter, string> = {
  all: "ALL",
  critical: "CRITICAL",
  minor: "MINOR",
  fixed: "FIXED",
};

const EMPTY_MESSAGES: Record<Exclude<DiagnosticFilter, "all">, string> = {
  critical: "No critical codes.",
  minor: "No minor codes.",
  fixed: "No fixed codes.",
};

interface VehicleDiagnosticTrackerProps {
  vehicleId: string;
  diagnostics: VehicleDiagnostic[] | null;
  loadError: string | null;
}

export function VehicleDiagnosticTracker({
  vehicleId,
  diagnostics,
  loadError,
}: VehicleDiagnosticTrackerProps) {
  const [selection, setSelection] = useState<{
    vehicleId: string;
    filter: DiagnosticFilter;
  }>({ vehicleId, filter: "all" });
  const activeFilter =
    selection.vehicleId === vehicleId ? selection.filter : "all";

  const records = diagnostics ?? [];
  const counts = {
    all: records.length,
    critical: records.filter(
      (diagnostic) =>
        diagnostic.status !== "resolved" && diagnostic.severity === "critical",
    ).length,
    minor: records.filter(
      (diagnostic) =>
        diagnostic.status !== "resolved" && diagnostic.severity === "minor",
    ).length,
    fixed: records.filter((diagnostic) => diagnostic.status === "resolved").length,
  };
  const filteredDiagnostics =
    activeFilter === "all"
      ? records
      : records.filter((diagnostic) =>
          activeFilter === "fixed"
            ? diagnostic.status === "resolved"
            : diagnostic.status !== "resolved" &&
              diagnostic.severity === activeFilter,
        );

  return (
    <section
      className="open-build__diagnostics"
      aria-labelledby="diagnostic-tracker-heading"
    >
      <DiagnosticTrackerHeader
        vehicleId={vehicleId}
        canAdd={Boolean(diagnostics && !loadError)}
      />

      {loadError || !diagnostics ? (
        <p role="alert" className="open-build__diagnostic-load-error">
          {loadError ??
            "Diagnostic records are unavailable. Refresh the page and try again."}
        </p>
      ) : (
        <>
          <div
            className="open-build__diagnostic-filters"
            role="group"
            aria-label="Filter diagnostic codes"
          >
            {DIAGNOSTIC_FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                className="open-build__diagnostic-filter"
                data-filter={filter}
                aria-label={`${FILTER_LABELS[filter]} diagnostic codes: ${counts[filter]}`}
                aria-pressed={activeFilter === filter}
                onClick={() => setSelection({ vehicleId, filter })}
              >
                <span className="open-build__diagnostic-filter-label">
                  {FILTER_LABELS[filter]}
                </span>
                <span className="open-build__diagnostic-filter-count">
                  {counts[filter]}
                </span>
              </button>
            ))}
          </div>

          {filteredDiagnostics.length === 0 ? (
            <p role="status" className="open-build__diagnostic-empty">
              {activeFilter === "all"
                ? "No diagnostic codes are recorded for this vehicle."
                : EMPTY_MESSAGES[activeFilter]}
            </p>
          ) : (
            <ul className="open-build__diagnostic-list" aria-label="Vehicle diagnostic records">
              {filteredDiagnostics.map((diagnostic) => (
                <DiagnosticRow
                  key={diagnostic.id}
                  vehicleId={vehicleId}
                  diagnostic={diagnostic}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
