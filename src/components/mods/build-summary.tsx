import { getBuildTelemetry } from "@/lib/build-telemetry";
import type { Mod } from "@/types/database";
import { StatusBadge } from "@/components/ui/status-badge";

interface BuildSummaryProps {
  mods: Mod[];
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function BuildSummary({ mods }: BuildSummaryProps) {
  const {
    totalModCount,
    installedCount,
    orderedCount,
    wishlistCount,
    installedCost,
    plannedCost,
    progress,
  } = getBuildTelemetry(mods);

  return (
    <section className="build-telemetry" aria-label="Vehicle build telemetry">
      <div>
        <div className="build-telemetry__heading">
          <h2 className="technical-label">Modification status</h2>
          <span className="build-telemetry__tracked">{totalModCount} tracked</span>
        </div>
        <dl className="build-telemetry__status-grid">
          <div className="build-telemetry__status">
            <dt><StatusBadge status="Installed" /></dt>
            <dd>{installedCount}</dd>
          </div>
          <div className="build-telemetry__status">
            <dt><StatusBadge status="Ordered" /></dt>
            <dd>{orderedCount}</dd>
          </div>
          <div className="build-telemetry__status">
            <dt><StatusBadge status="Wishlist" /></dt>
            <dd>{wishlistCount}</dd>
          </div>
        </dl>
      </div>

      <dl className="build-telemetry__investment">
        <div>
          <dt className="technical-label">Installed cost</dt>
          <dd className="build-telemetry__amount build-telemetry__amount--installed">
            {currencyFormatter.format(installedCost)}
          </dd>
        </div>
        <div>
          <dt className="technical-label">Planned cost</dt>
          <dd className="build-telemetry__amount">
            {currencyFormatter.format(plannedCost)}
          </dd>
          <dd className="build-telemetry__caption">Ordered + wishlist</dd>
        </div>
      </dl>

      <div className="build-telemetry__progress">
        <div className="build-telemetry__heading">
          <h2 className="technical-label">Tracked build progress</h2>
          <span className="build-telemetry__percent">{progress}%</span>
        </div>
        <div
          className="build-telemetry__track"
          role="progressbar"
          aria-label="Tracked modifications installed"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <p className="build-telemetry__caption">
          {totalModCount === 0
            ? "No tracked parts yet. This is not mechanical completeness."
            : `${installedCount} of ${totalModCount} tracked parts installed; not mechanical completeness.`}
        </p>
      </div>
    </section>
  );
}
