"use client";

import { useEffect, useRef, useState } from "react";
import type { VehicleWithMedia } from "@/types/vehicle-media";

interface VehicleSpecsSheetProps {
  vehicle: VehicleWithMedia;
  onClose: () => void;
  onEdit: () => void;
}

function maskVin(vin: string): string {
  if (vin.length < 10) {
    return vin;
  }

  return `${vin.slice(0, 5)}${"•".repeat(vin.length - 9)}${vin.slice(-4)}`;
}

export function VehicleSpecsSheet({
  vehicle,
  onClose,
  onEdit,
}: VehicleSpecsSheetProps) {
  const doneRef = useRef<HTMLButtonElement>(null);
  const [isVinVisible, setIsVinVisible] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy");
  const vin = vehicle.vin?.trim() || null;
  const yearMakeModel = [vehicle.year, vehicle.make, vehicle.model]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    doneRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleCopy() {
    if (!vin) {
      return;
    }

    try {
      await navigator.clipboard.writeText(vin);
      setCopyLabel("Copied");
    } catch {
      setCopyLabel("Copy failed");
    }

    window.setTimeout(() => setCopyLabel("Copy"), 1800);
  }

  return (
    <div
      className="specs-sheet__backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="specs-sheet-heading"
        className="specs-sheet"
      >
        <header className="specs-sheet__header">
          <div>
            <p className="specs-sheet__eyebrow">Vehicle Profile</p>
            <h2 id="specs-sheet-heading" className="specs-sheet__title">
              Vehicle Specs &amp; VIN
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Specs & VIN"
            className="specs-sheet__close"
          >
            ×
          </button>
        </header>

        <div className="specs-sheet__vin">
          <p className="specs-sheet__label">
            {vin ? "Chassis VIN (privacy masked)" : "Chassis VIN"}
          </p>
          {vin ? (
            <div className="specs-sheet__vin-row">
              <p className="specs-sheet__vin-value">
                {isVinVisible ? vin : maskVin(vin)}
              </p>
              <div className="specs-sheet__vin-actions">
                <button
                  type="button"
                  onClick={() => setIsVinVisible((visible) => !visible)}
                  aria-pressed={isVinVisible}
                  aria-label={isVinVisible ? "Hide VIN" : "Show VIN"}
                  className="specs-sheet__icon-button"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path
                      d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
                    {isVinVisible && (
                      <path d="M4 20L20 4" stroke="currentColor" strokeWidth="1.7" />
                    )}
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="specs-sheet__copy"
                  aria-live="polite"
                >
                  {copyLabel}
                </button>
              </div>
            </div>
          ) : (
            <p className="specs-sheet__empty">No VIN saved for this vehicle.</p>
          )}
        </div>

        <dl className="specs-sheet__grid">
          <SpecTile label="Year / Make / Model" value={yearMakeModel} />
          <SpecTile label="Trim" value={vehicle.trim} />
        </dl>

        <div className="specs-sheet__actions">
          <button type="button" onClick={onEdit} className="specs-sheet__edit">
            Edit Vehicle
          </button>
          <button
            ref={doneRef}
            type="button"
            onClick={onClose}
            className="specs-sheet__done"
          >
            Done
          </button>
        </div>
      </section>
    </div>
  );
}

function SpecTile({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="specs-sheet__tile">
      <dt className="specs-sheet__label">{label}</dt>
      <dd className="specs-sheet__value">{value || "Not provided"}</dd>
    </div>
  );
}
