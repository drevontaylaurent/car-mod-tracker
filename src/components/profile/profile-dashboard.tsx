"use client";

import { useState } from "react";
import { SignOutControl } from "@/components/auth/sign-out-control";
import { GarageBottomNavigation } from "@/components/garage/garage-bottom-navigation";
import { ShareBuildSheet } from "@/components/profile/share-build-sheet";
import type { GarageModSummary } from "@/types/garage";
import type { VehicleWithMedia } from "@/types/vehicle-media";

interface ProfileDashboardProps {
  identity: string;
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

export function ProfileDashboard({
  identity,
  vehicles,
  modSummaries,
  summaryError,
}: ProfileDashboardProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [showCosts, setShowCosts] = useState(true);
  const installedCost = modSummaries.reduce(
    (total, summary) => total + summary.installedCost,
    0,
  );
  const plannedCost = modSummaries.reduce(
    (total, summary) => total + summary.plannedCost,
    0,
  );
  const initials = identity
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "B";
  const vehicleLabel = `${vehicles.length} ${vehicles.length === 1 ? "vehicle" : "vehicles"}`;

  return (
    <main className="profile-page">
      <header className="profile-header">
        <div className="profile-header__brand-mark" aria-hidden="true">{initials}</div>
        <div>
          <p>Car Mod Tracker</p>
          <span>Builder Profile</span>
        </div>
      </header>

      <div className="profile-content">
        <section className="profile-identity" aria-labelledby="profile-heading">
          <div className="profile-identity__summary">
            <div className="profile-identity__avatar" aria-hidden="true">
              {initials}
              <span />
            </div>
            <div>
              <p className="technical-label text-accent">Authenticated Builder</p>
              <h1 id="profile-heading">{identity}</h1>
              <span className="profile-identity__count">{vehicleLabel}</span>
            </div>
          </div>
          <div className="profile-identity__actions">
            <button
              type="button"
              disabled={vehicles.length === 0}
              onClick={() => setIsSharing(true)}
            >
              <span aria-hidden="true">▦</span>
              <span>My QR Code<small>Open share link</small></span>
            </button>
            <button
              type="button"
              disabled={vehicles.length === 0}
              onClick={() => setIsSharing(true)}
            >
              <span>Public Profile<small>Share a selected build</small></span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
          {vehicles.length === 0 && (
            <p className="profile-identity__empty">
              Add a vehicle before creating a shared build link.
            </p>
          )}
        </section>

        <section className="profile-telemetry" aria-labelledby="profile-telemetry-heading">
          <div className="profile-section-heading">
            <h2 id="profile-telemetry-heading">Fleet Telemetry & Invested</h2>
            <button
              type="button"
              aria-pressed={showCosts}
              onClick={() => setShowCosts((visible) => !visible)}
            >
              {showCosts ? "Hide costs" : "Show costs"}
            </button>
          </div>
          <div className="profile-telemetry__totals">
            <div>
              <p>Total Invested</p>
              <strong>
                {summaryError
                  ? "Unavailable"
                  : showCosts
                    ? currencyFormatter.format(installedCost)
                    : "••••••"}
              </strong>
              <span>Installed across {vehicleLabel}</span>
            </div>
            <div>
              <p>Total Planned</p>
              <strong>
                {summaryError
                  ? "Unavailable"
                  : showCosts
                    ? currencyFormatter.format(plannedCost)
                    : "••••••"}
              </strong>
              <span>Ordered + Wishlist</span>
            </div>
          </div>
          {summaryError && <p role="alert" className="profile-error">{summaryError}</p>}
        </section>

        <section className="profile-community" aria-labelledby="profile-community-heading">
          <div className="profile-section-heading">
            <h2 id="profile-community-heading">Friends & Crew</h2>
            <span>Coming next</span>
          </div>
          <div className="profile-community__future">
            <span aria-hidden="true">+</span>
            <div>
              <strong>Community connections coming next</strong>
              <p>Builder and crew sharing will appear here when available.</p>
            </div>
          </div>
        </section>

        <section className="profile-actions" aria-label="Profile actions">
          <SignOutControl label="Sign Out of Garage" />
        </section>
      </div>

      <GarageBottomNavigation active="profile" />
      {isSharing && (
        <ShareBuildSheet
          vehicles={vehicles}
          onClose={() => setIsSharing(false)}
        />
      )}
    </main>
  );
}
