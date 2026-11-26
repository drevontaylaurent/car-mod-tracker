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
  const isBuild = variant === "build";

  return (
    <div
      role="img"
      aria-label={
        isBuild
          ? isUnavailable
            ? `Vehicle photo unavailable for ${vehicleName}; showing illustrative fallback`
            : `Illustrative vehicle ${isLoading ? "photo loading" : "fallback"} for ${vehicleName}`
          : isUnavailable
            ? `Vehicle photo unavailable for ${vehicleName}; showing fallback`
            : `Vehicle photo ${isLoading ? "loading" : "placeholder"} for ${vehicleName}`
      }
      className={`vehicle-visual${variant === "build" ? " vehicle-visual--build" : ""}`}
    >
      <div className="vehicle-visual__frame" aria-hidden="true" />
      <div className="vehicle-visual__topline">
        <span>{isBuild ? "ILLUSTRATIVE VISUAL" : "VISUAL / 01"}</span>
        <span>
          {isLoading
            ? "PHOTO LOADING"
            : isUnavailable
              ? "PHOTO UNAVAILABLE"
              : isBuild
                ? "NO OWNER PHOTO"
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
        <span className="technical-label">
          {isBuild ? "Vehicle representation" : "Vehicle image slot"}
        </span>
        <span className="vehicle-visual__hint">
          {isLoading
            ? "Loading vehicle photo"
            : isUnavailable
              ? isBuild
                ? "Illustrative fallback active"
                : "Futuristic visual fallback active"
              : isBuild
                ? "Illustrative fallback; upload a photo of your vehicle"
                : "Personal vehicle photography ready"}
        </span>
      </div>
      <div className="vehicle-visual__baseline" aria-hidden="true">
        <span>
          {isLoading
            ? "LOADING IMAGE"
            : isUnavailable
              ? isBuild
                ? "ILLUSTRATIVE FALLBACK"
                : "FALLBACK ACTIVE"
              : isBuild
                ? "NO OWNER PHOTO"
                : "NO PHOTO ADDED"}
        </span>
        <span>{isBuild ? "VEHICLE REPRESENTATION" : "PROFILE VISUAL"}</span>
      </div>
    </div>
  );
}
