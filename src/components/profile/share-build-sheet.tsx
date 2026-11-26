"use client";

import { useState, useTransition } from "react";
import { enableVehicleShare } from "@/actions/sharing";
import { VehicleVisual } from "@/components/garage/vehicle-visual";
import type { VehicleWithMedia } from "@/types/vehicle-media";

interface ShareBuildSheetProps {
  vehicles: VehicleWithMedia[];
  onClose: () => void;
}

export function ShareBuildSheet({
  vehicles,
  onClose,
}: ShareBuildSheetProps) {
  const [selectedId, setSelectedId] = useState(vehicles[0]?.id ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === selectedId);

  function copyBuildLink() {
    setMessage(null);
    startTransition(async () => {
      const result = await enableVehicleShare(selectedId);
      if (!result.success) {
        setMessage(result.error);
        return;
      }

      const url = `${window.location.origin}/shared/${result.data.token}`;
      try {
        await navigator.clipboard.writeText(url);
        setMessage("Build link copied.");
      } catch {
        setMessage(`Sharing enabled. Copy this link: ${url}`);
      }
    });
  }

  return (
    <div className="profile-sheet-backdrop" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-build-heading"
        className="profile-sheet"
      >
        <header>
          <div>
            <p className="technical-label text-accent">Read-only build link</p>
            <h2 id="share-build-heading">Share Build</h2>
            <p>Costs and private vehicle details are never included.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Close share build"
            className="button-ghost"
          >
            ×
          </button>
        </header>

        <div className="profile-sheet__vehicles" role="radiogroup" aria-label="Vehicle to share">
          {vehicles.map((vehicle) => {
            const title =
              vehicle.nickname ||
              [vehicle.year, vehicle.make, vehicle.model]
                .filter(Boolean)
                .join(" ") ||
              "Vehicle";
            const specs = [vehicle.year, vehicle.make, vehicle.model, vehicle.trim]
              .filter(Boolean)
              .join(" ");
            return (
              <button
                key={vehicle.id}
                type="button"
                role="radio"
                aria-checked={selectedId === vehicle.id}
                onClick={() => {
                  setSelectedId(vehicle.id);
                  setMessage(null);
                }}
              >
                <VehicleVisual vehicleName={title} photoUrl={vehicle.photoUrl} />
                <span>
                  <strong>{title}</strong>
                  <small>{specs || "Vehicle specifications not set"}</small>
                </span>
              </button>
            );
          })}
        </div>

        {selectedVehicle && (
          <div className="profile-sheet__privacy">
            <span aria-hidden="true">●</span>
            Read-only public build; costs, VIN, diagnostics, and owner controls stay private.
          </div>
        )}
        {message && (
          <p
            className="state-message"
            role={message.includes("copied") || message.includes("enabled") ? "status" : "alert"}
            data-tone={message.includes("copied") || message.includes("enabled") ? "success" : "error"}
          >
            {message}
          </p>
        )}
        <button
          type="button"
          className="button-primary profile-sheet__copy"
          disabled={!selectedVehicle || isPending}
          onClick={copyBuildLink}
        >
          {isPending ? "Preparing link..." : "Copy Build Link"}
        </button>
      </section>
    </div>
  );
}
