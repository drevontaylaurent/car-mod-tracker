import type { VehicleEntryMode } from "@/components/garage/vehicle-fields";

interface AddVehicleMethodSelectionProps {
  onSelectMode: (mode: VehicleEntryMode) => void;
  onCancel: () => void;
}

export function AddVehicleMethodSelection({
  onSelectMode,
  onCancel,
}: AddVehicleMethodSelectionProps) {
  return (
    <>
      <section aria-label="Choose vehicle entry method" className="add-vehicle-methods">
        <button
          type="button"
          className="add-vehicle-method add-vehicle-method--recommended"
          onClick={() => onSelectMode("vin")}
        >
          <span className="technical-label text-accent">
            Recommended / Fastest
          </span>
          <span className="add-vehicle-method__title">Decode VIN</span>
          <span className="add-vehicle-method__copy">
            Enter a 17-character VIN and Car Mod Tracker will automatically
            populate available vehicle information.
          </span>
          <span className="add-vehicle-method__action">
            Continue with VIN <span aria-hidden="true">→</span>
          </span>
        </button>
        <button
          type="button"
          className="add-vehicle-method"
          onClick={() => onSelectMode("manual")}
        >
          <span className="technical-label">Manual entry</span>
          <span className="add-vehicle-method__title">Enter Manually</span>
          <span className="add-vehicle-method__copy">
            Enter the vehicle year, make, model, trim, VIN, and nickname
            yourself.
          </span>
          <span className="add-vehicle-method__action">
            Enter vehicle details <span aria-hidden="true">→</span>
          </span>
        </button>
      </section>
      <div className="mt-6 flex justify-end">
        <button type="button" onClick={onCancel} className="button-secondary">
          Cancel
        </button>
      </div>
    </>
  );
}
