"use client";

import { BuildPhaseCard } from "@/components/timeline/build-phase-card";
import {
  BuildTimelineHistory,
  BuildTimelineSummary,
} from "@/components/timeline/build-timeline-summary";
import { CreateBuildPhaseForm } from "@/components/timeline/create-build-phase-form";
import {
  getBuildPhaseMetrics,
  getBuildTimelineMetrics,
} from "@/lib/build-timeline";
import type { BuildPhase } from "@/types/build-timeline";
import type { Mod } from "@/types/database";

interface BuildTimelineProps {
  vehicleId: string;
  phases: BuildPhase[] | null;
  mods: Mod[];
  loadError: string | null;
}

export function BuildTimeline({
  vehicleId,
  phases,
  mods,
  loadError,
}: BuildTimelineProps) {
  const metrics = phases ? getBuildTimelineMetrics(phases, mods) : null;
  const availableMods = mods.filter((mod) => !mod.phase_id);

  return (
    <section
      className="build-timeline"
      aria-labelledby="build-timeline-heading"
    >
      <header className="build-timeline__header">
        <div className="build-timeline__title">
          <svg viewBox="0 0 48 48" aria-hidden="true">
            <circle cx="24" cy="24" r="20" />
            <path d="M24 12v13l9 5" />
          </svg>
          <div>
            <h2 id="build-timeline-heading">Build Timeline</h2>
            <p>Plan. Track. Complete. Your build, one phase at a time.</p>
          </div>
        </div>
        <section
          className="build-timeline__overall"
          aria-label="Overall timeline progress"
        >
          <span>Overall Progress</span>
          {metrics && metrics.totalPhaseCount > 0 ? (
            <>
              <strong>{metrics.overallProgressPercent}%</strong>
              <progress
                max={100}
                value={metrics.overallProgressPercent}
                aria-label={`${metrics.completedPhaseCount} of ${metrics.totalPhaseCount} phases completed`}
              />
              <small>
                {metrics.completedPhaseCount} / {metrics.totalPhaseCount} phases
                complete
              </small>
            </>
          ) : (
            <p>No phases to measure yet.</p>
          )}
        </section>
      </header>

      {loadError || !phases ? (
        <p role="alert" className="build-timeline__load-error">
          {loadError ??
            "Build Timeline data is unavailable. Refresh the page and try again."}
        </p>
      ) : (
        <>
          {phases.length === 0 ? (
            <div className="build-timeline__empty">
              <p className="technical-label">BUILD TIMELINE</p>
              <h3>No build phases yet.</h3>
              <p>Create your first phase to start organizing your build.</p>
            </div>
          ) : (
            <>
              <ol className="build-timeline__phases" aria-label="Build phases">
                {phases.map((phase) => {
                  const phaseMods = mods.filter(
                    (mod) => mod.phase_id === phase.id,
                  );
                  return (
                    <BuildPhaseCard
                      key={`${phase.id}-${phase.updated_at}`}
                      vehicleId={vehicleId}
                      phase={phase}
                      metrics={getBuildPhaseMetrics(phase, mods)}
                      assignedMods={phaseMods}
                      availableMods={availableMods}
                    />
                  );
                })}
              </ol>
              {metrics && (
                <>
                  <BuildTimelineSummary
                    phases={phases}
                    mods={mods}
                    totalTrackedCost={metrics.trackedPhaseCost}
                  />
                  <BuildTimelineHistory mods={mods} />
                </>
              )}
            </>
          )}
          <CreateBuildPhaseForm vehicleId={vehicleId} />
        </>
      )}
    </section>
  );
}
