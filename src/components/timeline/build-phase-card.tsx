"use client";

import { useState } from "react";
import { getPhaseTitle } from "@/lib/phase-title";
import { AssignModificationControl } from "@/components/timeline/assign-modification-control";
import { BuildPhaseManagement } from "@/components/timeline/build-phase-management";
import { BuildPhaseControls } from "@/components/timeline/build-phase-controls";
import { PhaseModificationItem } from "@/components/timeline/phase-modification-item";
import type { BuildPhase } from "@/types/build-timeline";
import type { Mod } from "@/types/database";
import type { BuildPhaseMetrics } from "@/lib/build-timeline";

interface BuildPhaseCardProps {
  vehicleId: string;
  phase: BuildPhase;
  metrics: BuildPhaseMetrics;
  assignedMods: Mod[];
  availableMods: Mod[];
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatTargetDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

export function BuildPhaseCard({
  vehicleId,
  phase,
  metrics,
  assignedMods,
  availableMods,
}: BuildPhaseCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const bodyId = `phase-body-${phase.id}`;

  return (
    <li className="build-timeline__phase" data-status={phase.status}>
      <article className="build-timeline__phase-card">
        <header className="build-timeline__phase-header">
          <div className="build-timeline__phase-identity">
            <h3>{getPhaseTitle(phase)}</h3>
          </div>
          <div className="build-timeline__phase-cost">
            <strong>{currencyFormatter.format(metrics.trackedCost)}</strong>
            <span>
              {phase.status === "completed" ? "Total Cost" : "Est. Cost"}
            </span>
          </div>
          <button
            type="button"
            className="build-timeline__toggle"
            aria-expanded={isExpanded}
            aria-controls={bodyId}
            aria-label={`${isExpanded ? "Collapse" : "Expand"} phase ${phase.position}`}
            onClick={() => setIsExpanded((open) => !open)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 15 6-6 6 6" />
            </svg>
          </button>
        </header>

        <BuildPhaseControls
          vehicleId={vehicleId}
          phase={phase}
          installedModCount={metrics.installedModCount}
          totalModCount={metrics.totalModCount}
        />

        <div
          className="build-timeline__phase-progress"
          role="progressbar"
          aria-label={`Phase ${phase.position} modification progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={metrics.progressPercent}
        >
          <span style={{ width: `${metrics.progressPercent}%` }} />
        </div>
        <div className="build-timeline__phase-progress-caption">
          <span>{metrics.progressPercent}%</span>
          {phase.target_completion_date && (
            <span>
              Target completion ·{" "}
              {formatTargetDate(phase.target_completion_date)}
            </span>
          )}
        </div>

        <div id={bodyId} hidden={!isExpanded}>
        {phase.description && (
          <p className="build-timeline__phase-description">
            {phase.description}
          </p>
        )}
        <ul className="build-timeline__mod-list">
          {assignedMods.length > 0 ? (
            assignedMods.map((mod) => (
              <PhaseModificationItem
                key={mod.id}
                vehicleId={vehicleId}
                phase={phase}
                mod={mod}
              />
            ))
          ) : (
            <li className="build-timeline__no-mods">
              No modifications in this phase yet.
            </li>
          )}
        </ul>

        <AssignModificationControl
          vehicleId={vehicleId}
          phaseId={phase.id}
          availableMods={availableMods}
        />
        <BuildPhaseManagement vehicleId={vehicleId} phase={phase} />
        </div>
      </article>
    </li>
  );
}
