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
    return <p role="alert" className="state-message" data-tone="error">{error}</p>;
  }

  const installedCount = summary?.installedCount ?? 0;
  const totalModCount = summary?.totalModCount ?? 0;
  const progress =
    totalModCount === 0
      ? 0
      : Math.round((installedCount / totalModCount) * 100);

  return (
    <div className="vehicle-hub-summary">
      <section aria-label="Vehicle build progress">
        <div
          className="vehicle-hub-summary__progress"
          role="progressbar"
          aria-label="Tracked vehicle modifications installed"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <span className="vehicle-hub-summary__percent">{progress}%</span>
      </section>
      <dl className="vehicle-hub-summary__costs">
        <div>
          <dt>Installed Cost</dt>
          <dd>{currencyFormatter.format(summary?.installedCost ?? 0)}</dd>
        </div>
        <div>
          <dt>Planned Cost</dt>
          <dd>{currencyFormatter.format(summary?.plannedCost ?? 0)}</dd>
        </div>
      </dl>
    </div>
  );
}
