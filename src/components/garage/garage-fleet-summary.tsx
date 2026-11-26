import type { GarageModSummary } from "@/types/garage";
import type { VehicleWithMedia } from "@/types/vehicle-media";

interface GarageFleetSummaryProps {
  vehicles: VehicleWithMedia[];
  modSummaries: GarageModSummary[];
  summaryError?: string;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function getProgress(summary?: GarageModSummary) {
  if (!summary || summary.totalModCount === 0) return 0;
  return Math.round((summary.installedCount / summary.totalModCount) * 100);
}

export function GarageFleetSummary({
  vehicles,
  modSummaries,
  summaryError,
}: GarageFleetSummaryProps) {
  const summariesByVehicleId = new Map(
    modSummaries.map((summary) => [summary.vehicleId, summary]),
  );
  const progress =
    vehicles.length === 0
      ? 0
      : Math.round(
          vehicles.reduce(
            (total, vehicle) =>
              total + getProgress(summariesByVehicleId.get(vehicle.id)),
            0,
          ) / vehicles.length,
        );
  const installedCost = modSummaries.reduce(
    (total, summary) => total + summary.installedCost,
    0,
  );
  const plannedCost = modSummaries.reduce(
    (total, summary) => total + summary.plannedCost,
    0,
  );

  return (
    <section className="fleet-telemetry" aria-labelledby="fleet-progress-heading">
      <div className="fleet-telemetry__progress-heading">
        <h2 id="fleet-progress-heading">Fleet Build Progress</h2>
        <span>{summaryError ? "Unavailable" : `${progress}%`}</span>
      </div>
      <div
        className="fleet-telemetry__track"
        role="progressbar"
        aria-label="Average fleet build progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={summaryError ? undefined : progress}
      >
        <span style={{ width: summaryError ? "0%" : `${progress}%` }} />
      </div>
      <div className="fleet-telemetry__totals">
        <div className="fleet-telemetry__total">
          <p>Total Installed</p>
          <strong>{summaryError ? "Unavailable" : currencyFormatter.format(installedCost)}</strong>
          <span>{vehicles.length} {vehicles.length === 1 ? "vehicle" : "vehicles"} in bay</span>
        </div>
        <div className="fleet-telemetry__total">
          <p>Total Planned</p>
          <strong>{summaryError ? "Unavailable" : currencyFormatter.format(plannedCost)}</strong>
          <span>Ordered + Wishlist</span>
        </div>
      </div>
    </section>
  );
}
