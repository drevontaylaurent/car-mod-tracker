import { getBuildPhaseMetrics } from "@/lib/build-timeline";
import { getPhaseTitle } from "@/lib/phase-title";
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

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value.slice(0, 10)}T00:00:00.000Z`));
}

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
      <h3 id="build-timeline-summary-heading">Build Summary</h3>
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
                  {getPhaseTitle(phase)}
                  <small>{statusLabel}</small>
                </span>
              </span>
              <strong>{currencyFormatter.format(metrics.trackedCost)}</strong>
            </li>
          );
        })}
      </ul>
      <div className="build-timeline__summary-total">
        <span>Estimated Total Build Cost</span>
        <strong>{currencyFormatter.format(totalTrackedCost)}</strong>
      </div>
    </section>
  );
}

export function BuildTimelineHistory({ mods }: { mods: Mod[] }) {
  const recent = mods
    .filter((mod) => mod.status === "Installed" && mod.install_date)
    .sort((a, b) => (b.install_date ?? "").localeCompare(a.install_date ?? ""))
    .slice(0, 5);

  if (recent.length === 0) {
    return null;
  }

  return (
    <section
      className="build-timeline__summary build-timeline__history"
      aria-labelledby="build-timeline-history-heading"
    >
      <h3 id="build-timeline-history-heading">Recent Build History</h3>
      <ul>
        {recent.map((mod) => (
          <li key={mod.id}>
            <span className="build-timeline__history-name">
              {mod.part_name} Installed
            </span>
            <time dateTime={mod.install_date ?? undefined}>
              {formatDate(mod.install_date ?? "")}
            </time>
          </li>
        ))}
      </ul>
    </section>
  );
}
