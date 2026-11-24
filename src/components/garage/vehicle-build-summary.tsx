import { StatusBadge } from "@/components/ui/status-badge";
import type { GarageModSummary } from "@/types/garage";

interface VehicleBuildSummaryProps {
  summary?: GarageModSummary;
  error?: string;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function VehicleBuildSummary({
  summary,
  error,
}: VehicleBuildSummaryProps) {
  if (error) {
    return (
      <p role="alert" className="state-message" data-tone="error">
        Build summary unavailable: {error}
      </p>
    );
  }

  const installedCount = summary?.installedCount ?? 0;
  const orderedCount = summary?.orderedCount ?? 0;
  const wishlistCount = summary?.wishlistCount ?? 0;
  const totalModCount = summary?.totalModCount ?? 0;
  const progress =
    totalModCount === 0
      ? 0
      : Math.round((installedCount / totalModCount) * 100);

  return (
    <div className="vehicle-summary">
      <section aria-label="Modification status summary">
        <div className="vehicle-summary__section-heading">
          <h3 className="technical-label">Modification snapshot</h3>
          <span className="vehicle-summary__total">
            {totalModCount} tracked
          </span>
        </div>
        <dl className="vehicle-summary__statuses">
          <div className="vehicle-summary__status">
            <dt>
              <StatusBadge status="Installed" />
            </dt>
            <dd>{installedCount}</dd>
          </div>
          <div className="vehicle-summary__status">
            <dt>
              <StatusBadge status="Ordered" />
            </dt>
            <dd>{orderedCount}</dd>
          </div>
          <div className="vehicle-summary__status">
            <dt>
              <StatusBadge status="Wishlist" />
            </dt>
            <dd>{wishlistCount}</dd>
          </div>
        </dl>
      </section>

      <dl className="vehicle-summary__investment">
        <div>
          <dt className="technical-label">Installed investment</dt>
          <dd className="vehicle-summary__amount">
            {currencyFormatter.format(summary?.installedCost ?? 0)}
          </dd>
        </div>
        <div>
          <dt className="technical-label">Planned investment</dt>
          <dd className="vehicle-summary__amount">
            {currencyFormatter.format(summary?.plannedCost ?? 0)}
          </dd>
          <dd className="vehicle-summary__caption">Ordered + wishlist</dd>
        </div>
      </dl>

      <section aria-label="Tracked build progress" className="vehicle-progress">
        <div className="vehicle-progress__heading">
          <h3 className="technical-label">Tracked build progress</h3>
          <span className="vehicle-progress__percent">{progress}%</span>
        </div>
        <div
          className="vehicle-progress__track"
          role="progressbar"
          aria-label="Tracked modifications installed"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <p className="vehicle-summary__caption">
          {totalModCount === 0
            ? "No tracked mods yet. Progress reflects tracked items, not mechanical completeness."
            : `${installedCount} of ${totalModCount} tracked modifications installed. Not mechanical completeness.`}
        </p>
      </section>
    </div>
  );
}
