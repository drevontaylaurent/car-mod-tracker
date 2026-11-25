"use client";

import Image from "next/image";
import { useState } from "react";
import { VehicleImagePlaceholder } from "@/components/garage/vehicle-image-placeholder";

interface VehicleVisualProps {
  vehicleName: string;
  photoUrl: string | null;
  variant?: "garage" | "build";
}

export function VehicleVisual({
  vehicleName,
  photoUrl,
  variant = "garage",
}: VehicleVisualProps) {
  const [loadedPhotoUrl, setLoadedPhotoUrl] = useState<string | null>(null);
  const [failedPhotoUrl, setFailedPhotoUrl] = useState<string | null>(null);

  if (!photoUrl || failedPhotoUrl === photoUrl) {
    return (
      <VehicleImagePlaceholder
        vehicleName={vehicleName}
        variant={variant}
        state={
          photoUrl !== null && failedPhotoUrl === photoUrl
            ? "unavailable"
            : "empty"
        }
      />
    );
  }

  const isLoaded = loadedPhotoUrl === photoUrl;
  const variantClass = variant === "build" ? " vehicle-visual--build" : "";

  return (
    <div
      className={`vehicle-visual vehicle-visual--photo${variantClass}`}
      data-photo-loaded={isLoaded}
    >
      {!isLoaded && (
        <div className="vehicle-visual__loading-fallback" aria-hidden="true">
          <VehicleImagePlaceholder
            vehicleName={vehicleName}
            variant={variant}
            state="loading"
          />
        </div>
      )}
      {!isLoaded && (
        <span className="sr-only" role="status">
          Loading photo of {vehicleName}.
        </span>
      )}
      <Image
        src={photoUrl}
        alt={`Photo of ${vehicleName}`}
        fill
        unoptimized
        sizes={
          variant === "build"
            ? "(min-width: 1024px) 55vw, 100vw"
            : "(min-width: 1024px) 35vw, 100vw"
        }
        loading={variant === "build" ? "eager" : "lazy"}
        className="vehicle-visual__photo"
        onLoad={() => setLoadedPhotoUrl(photoUrl)}
        onError={() => setFailedPhotoUrl(photoUrl)}
      />
    </div>
  );
}
