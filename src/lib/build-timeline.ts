import type { BuildPhase } from "@/types/build-timeline";
import type { Mod } from "@/types/database";

export interface BuildPhaseMetrics {
  installedModCount: number;
  totalModCount: number;
  progressPercent: number;
  trackedCost: number;
}

export interface BuildTimelineMetrics {
  completedPhaseCount: number;
  totalPhaseCount: number;
  overallProgressPercent: number;
  trackedPhaseCost: number;
}

export function getBuildPhaseMetrics(
  phase: BuildPhase,
  mods: readonly Mod[],
): BuildPhaseMetrics {
  const phaseMods = mods.filter((mod) => mod.phase_id === phase.id);
  const installedModCount = phaseMods.filter(
    (mod) => mod.status === "Installed",
  ).length;

  return {
    installedModCount,
    totalModCount: phaseMods.length,
    progressPercent:
      phaseMods.length === 0
        ? 0
        : Math.round((installedModCount / phaseMods.length) * 100),
    trackedCost: phaseMods.reduce((total, mod) => total + mod.cost, 0),
  };
}

export function getBuildTimelineMetrics(
  phases: readonly BuildPhase[],
  mods: readonly Mod[],
): BuildTimelineMetrics {
  const completedPhaseCount = phases.filter(
    (phase) => phase.status === "completed",
  ).length;
  const phaseIds = new Set(phases.map((phase) => phase.id));
  const trackedPhaseCost = mods.reduce(
    (total, mod) =>
      mod.phase_id && phaseIds.has(mod.phase_id) ? total + mod.cost : total,
    0,
  );

  return {
    completedPhaseCount,
    totalPhaseCount: phases.length,
    overallProgressPercent:
      phases.length === 0
        ? 0
        : Math.round((completedPhaseCount / phases.length) * 100),
    trackedPhaseCost,
  };
}
