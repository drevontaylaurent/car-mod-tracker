interface VehicleImagePlaceholderProps {
  vehicleName: string;
  variant?: "garage" | "build";
  state?: "empty" | "loading" | "unavailable";
}

export function VehicleImagePlaceholder({
  vehicleName,
  variant = "garage",
  state = "empty",
}: VehicleImagePlaceholderProps) {
  const isLoading = state === "loading";
  const isUnavailable = state === "unavailable";

  return (
    <div
      role="img"
      aria-label={
        isUnavailable
          ? `Vehicle photo unavailable for ${vehicleName}; showing fallback`
          : `Vehicle photo ${isLoading ? "loading" : "placeholder"} for ${vehicleName}`
      }
      className={`vehicle-visual${variant === "build" ? " vehicle-visual--build" : ""}`}
    >
      <div className="vehicle-visual__frame" aria-hidden="true" />
      <div className="vehicle-visual__topline">
        <span>VISUAL / 01</span>
        <span>
          {isLoading
            ? "PHOTO LOADING"
            : isUnavailable
              ? "PHOTO UNAVAILABLE"
              : "PHOTO SLOT OPEN"}
        </span>
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
          {isLoading
            ? "Loading vehicle photo"
            : isUnavailable
              ? "Futuristic visual fallback active"
              : "Personal vehicle photography ready"}
        </span>
      </div>
      <div className="vehicle-visual__baseline" aria-hidden="true">
        <span>
          {isLoading
            ? "LOADING IMAGE"
            : isUnavailable
              ? "FALLBACK ACTIVE"
              : "NO PHOTO ADDED"}
        </span>
        <span>PROFILE VISUAL</span>
      </div>
    </div>
  );
}
