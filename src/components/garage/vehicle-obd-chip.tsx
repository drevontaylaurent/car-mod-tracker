"use client";

import { getDiagnosticSummary } from "@/lib/diagnostic-summary";
import type { VehicleDiagnostic } from "@/types/diagnostics";

interface VehicleObdChipProps {
  diagnostics: VehicleDiagnostic[] | null;
  diagnosticsError: string | null;
  onOpenDiagnostics: () => void;
}

export function VehicleObdChip({
  diagnostics,
  diagnosticsError,
  onOpenDiagnostics,
}: VehicleObdChipProps) {
  const summary = diagnostics ? getDiagnosticSummary(diagnostics) : null;
  const severity = summary?.highestUnresolvedSeverity ?? null;
  const unavailable = Boolean(diagnosticsError) || !summary;
  const severityCount = severity
    ? (diagnostics ?? []).filter(
        (item) => item.status !== "resolved" && item.severity === severity,
      ).length
    : 0;
  const badge = unavailable
    ? "Unavailable"
    : severity
      ? `${severityCount} ${severity === "critical" ? "Critical" : "Minor"}`
      : "No active codes";
  const label =
    !summary || diagnosticsError
      ? "OBD-II tracker unavailable. Open OBD-II tab."
      : summary.unresolvedCount === 0
        ? "OBD-II: no active diagnostic records. This is not a vehicle-health assessment. Open OBD-II tab."
        : `OBD-II: ${summary.unresolvedCount} unresolved records, highest severity ${severity}. Open OBD-II tab.`;

  return (
    <button
      type="button"
      className="open-build__chip open-build__obd-chip"
      data-severity={unavailable ? "none" : (severity ?? "none")}
      aria-label={label}
      onClick={onOpenDiagnostics}
    >
      <span className="open-build__obd-dot" aria-hidden="true" />
      <span>OBD-II</span>
      <span className="open-build__obd-badge">{badge}</span>
    </button>
  );
}
