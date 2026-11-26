import { getBuildTelemetry } from "@/lib/build-telemetry";
import type { Mod, ModStatus } from "@/types/database";

interface BuildSummaryProps {
  mods: Mod[];
  statusFilter: ModStatus | null;
  onStatusFilterChange: (status: ModStatus | null) => void;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function BuildSummary({
  mods,
  statusFilter,
  onStatusFilterChange,
}: BuildSummaryProps) {
  const {
    totalModCount,
    installedCount,
    orderedCount,
    wishlistCount,
    installedCost,
    plannedCost,
    progress,
  } = getBuildTelemetry(mods);
  const statusCounts = {
    all: totalModCount,
    Installed: installedCount,
    Ordered: orderedCount,
    Wishlist: wishlistCount,
  };
  const statusControls: {
    value: ModStatus | null;
    label: string;
    accessibleLabel: string;
    count: number;
  }[] = [
    { value: null, label: "ALL", accessibleLabel: "All", count: statusCounts.all },
    {
      value: "Installed",
      label: "INST.",
      accessibleLabel: "Installed",
      count: statusCounts.Installed,
    },
    {
      value: "Ordered",
      label: "ORD.",
      accessibleLabel: "Ordered",
      count: statusCounts.Ordered,
    },
    {
      value: "Wishlist",
      label: "WISH",
      accessibleLabel: "Wishlist",
      count: statusCounts.Wishlist,
    },
  ];

  return (
    <section className="open-build__telemetry" aria-label="Vehicle build telemetry">
      <div className="open-build__telemetry-primary">
        <section className="open-build__progress" aria-labelledby="build-progress-heading">
          <div className="open-build__progress-heading">
            <h2 id="build-progress-heading" className="technical-label">
              Tracked build progress
            </h2>
            <span className="open-build__progress-percent">{progress}%</span>
          </div>
          <div
            className="open-build__progress-track"
            role="progressbar"
            aria-label="Tracked modifications installed"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="open-build__progress-meta">
            <p className="open-build__progress-caption">
              {installedCount} of {totalModCount} tracked parts installed.
            </p>
            <ul className="open-build__legend" aria-hidden="true">
              <li data-status="Installed">Inst</li>
              <li data-status="Ordered">Ord</li>
              <li data-status="Wishlist">Wish</li>
            </ul>
          </div>
        </section>

        <dl className="open-build__costs">
          <div>
            <dt className="technical-label">Installed cost</dt>
            <dd className="open-build__cost open-build__cost--installed">
              {currencyFormatter.format(installedCost)}
            </dd>
            <dd className="open-build__cost-caption">Completed &amp; on car</dd>
          </div>
          <div>
            <dt className="technical-label">Planned cost</dt>
            <dd className="open-build__cost">
              {currencyFormatter.format(plannedCost)}
            </dd>
            <dd className="open-build__cost-caption">Ordered + Wishlist</dd>
          </div>
        </dl>
      </div>

      <div className="open-build__status-summary" role="group" aria-label="Filter modifications by status">
        {statusControls.map((control) => (
          <button
            key={control.value ?? "all"}
            type="button"
            className="open-build__status-control"
            data-status={control.value ?? "All"}
            aria-label={`${control.accessibleLabel} modifications: ${control.count}`}
            aria-pressed={statusFilter === control.value}
            onClick={() => onStatusFilterChange(control.value)}
          >
            <span className="open-build__status-label">
              {control.value && (
                <span className="open-build__filter-dot" aria-hidden="true" />
              )}
              {control.label}
            </span>
            <span className="open-build__status-count">{control.count}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
