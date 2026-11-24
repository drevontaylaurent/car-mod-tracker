interface VehicleImagePlaceholderProps {
  vehicleName: string;
  variant?: "garage" | "build";
}

export function VehicleImagePlaceholder({
  vehicleName,
  variant = "garage",
}: VehicleImagePlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={`Vehicle photo placeholder for ${vehicleName}`}
      className={`vehicle-visual${variant === "build" ? " vehicle-visual--build" : ""}`}
    >
      <div className="vehicle-visual__frame" aria-hidden="true" />
      <div className="vehicle-visual__topline">
        <span>VISUAL / 01</span>
        <span>PHOTO SLOT OPEN</span>
      </div>
      <div className="vehicle-visual__center">
        <svg
          aria-hidden="true"
          viewBox="0 0 40 40"
          fill="none"
          className="vehicle-visual__icon"
        >
          <path
            d="M7 11.5h26v19H7zM7 27l7-7 5 5 4-4 10 9M14 16.5h.01"
            stroke="currentColor"
            strokeWidth="1.25"
          />
        </svg>
        <span className="technical-label">Vehicle image slot</span>
        <span className="vehicle-visual__hint">
          Personal vehicle photography ready
        </span>
      </div>
      <div className="vehicle-visual__baseline" aria-hidden="true">
        <span>NO PHOTO ADDED</span>
        <span>PROFILE VISUAL</span>
      </div>
    </div>
  );
}
