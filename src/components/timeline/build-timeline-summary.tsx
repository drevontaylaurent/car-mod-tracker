import { getBuildPhaseMetrics } from "@/lib/build-timeline";
import type { BuildPhase } from "@/types/build-timeline";
import type { Mod } from "@/types/database";

interface BuildTimelineSummaryProps {
  phases: BuildPhase[];
  mods: Mod[];
  totalTrackedCost: number;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function BuildTimelineSummary({
  phases,
  mods,
  totalTrackedCost,
}: BuildTimelineSummaryProps) {
  return (
    <section
      className="build-timeline__summary"
      aria-labelledby="build-timeline-summary-heading"
    >
      <h3 id="build-timeline-summary-heading">BUILD SUMMARY</h3>
      <ul>
        {phases.map((phase) => {
          const metrics = getBuildPhaseMetrics(phase, mods);
          const statusLabel =
            phase.status === "in_progress"
              ? "In Progress"
              : phase.status[0].toUpperCase() + phase.status.slice(1);
          return (
            <li key={phase.id} data-status={phase.status}>
              <span className="build-timeline__summary-phase">
                <span aria-hidden="true" />
                <span>
                  Phase {phase.position} · {phase.name}
                  <small>{statusLabel}</small>
                </span>
              </span>
              <strong>{currencyFormatter.format(metrics.trackedCost)}</strong>
            </li>
          );
        })}
      </ul>
      <div className="build-timeline__summary-total">
        <span>Total tracked phase cost</span>
        <strong>{currencyFormatter.format(totalTrackedCost)}</strong>
      </div>
    </section>
  );
}
