import { getBuildTelemetry } from "@/lib/build-telemetry";
import type { Mod, Vehicle } from "@/types/database";

interface VehicleProfilePanelProps {
  vehicle: Vehicle;
  vehicleName: string;
  mods: Mod[];
}

export function VehicleProfilePanel({
  vehicle,
  vehicleName,
  mods,
}: VehicleProfilePanelProps) {
  const { installedCount, totalModCount, progress } = getBuildTelemetry(mods);

  return (
    <section className="build-profile-panel" aria-labelledby="vehicle-profile-heading">
      <p className="technical-label text-accent">Vehicle profile / 01</p>
      <h2 id="vehicle-profile-heading" className="build-profile-panel__title">
        {vehicleName}
      </h2>
      <p className="build-profile-panel__identity">
        {[vehicle.year, vehicle.make, vehicle.model, vehicle.trim]
          .filter(Boolean)
          .join(" ") || "Vehicle specifications not set"}
      </p>

      <dl className="build-profile-panel__specifications">
        <Specification label="Year" value={vehicle.year?.toString()} />
        <Specification label="Make" value={vehicle.make} />
        <Specification label="Model" value={vehicle.model} />
        <Specification label="Trim" value={vehicle.trim} />
        <div className="build-profile-panel__vin">
          <dt className="technical-label">VIN</dt>
          <dd>{vehicle.vin}</dd>
        </div>
      </dl>

      <section
        className="build-profile-panel__progress"
        aria-label="Tracked build progress"
      >
        <div className="build-telemetry__heading">
          <h3 className="technical-label">Tracked build progress</h3>
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
      </section>
    </section>
  );
}

function Specification({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <dt className="technical-label">{label}</dt>
      <dd>{value || "—"}</dd>
    </div>
  );
}
