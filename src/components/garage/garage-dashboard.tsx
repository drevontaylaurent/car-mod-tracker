"use client";

import { useState } from "react";
import { GarageVehicleCarousel } from "@/components/garage/garage-vehicle-carousel";
import { AddVehicleModal } from "@/components/garage/add-vehicle-modal";
import { ApplicationHeader } from "@/components/layout/application-header";
import type { GarageModSummary } from "@/types/garage";
import type { VehicleWithMedia } from "@/types/vehicle-media";

interface GarageDashboardProps {
  vehicles: VehicleWithMedia[];
  modSummaries?: GarageModSummary[];
  summaryError?: string;
}

interface VehicleSelection {
  vehicleId: string;
  index: number;
}

export function GarageDashboard({
  vehicles,
  modSummaries = [],
  summaryError,
}: GarageDashboardProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selection, setSelection] = useState<VehicleSelection>({
    vehicleId: vehicles[0]?.id ?? "",
    index: 0,
  });
  const matchingIndex = vehicles.findIndex(
    (vehicle) => vehicle.id === selection.vehicleId,
  );
  const selectedIndex =
    matchingIndex >= 0
      ? matchingIndex
      : Math.min(selection.index, Math.max(vehicles.length - 1, 0));
  const selectedVehicle = vehicles[selectedIndex];
  const selectedVehicleId = selectedVehicle?.id ?? "";
  const summariesByVehicleId = new Map(
    modSummaries.map((summary) => [summary.vehicleId, summary]),
  );
  const totalInstalledInvestment = modSummaries.reduce(
    (total, summary) => total + summary.installedCost,
    0,
  );
  const averageBuildProgress =
    vehicles.length === 0
      ? 0
      : Math.round(
          vehicles.reduce((total, vehicle) => {
            const summary = summariesByVehicleId.get(vehicle.id);
            if (!summary || summary.totalModCount === 0) return total;
            return (
              total +
              Math.round(
                (summary.installedCount / summary.totalModCount) * 100,
              )
            );
          }, 0) / vehicles.length,
        );
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleBeforeDelete = (vehicleId?: string) => {
    if (!selectedVehicle) return;
    const deletedIndex = vehicleId
      ? vehicles.findIndex((vehicle) => vehicle.id === vehicleId)
      : selectedIndex;
    const nextIndex =
      deletedIndex >= 0 && deletedIndex < selectedIndex
        ? selectedIndex - 1
        : selectedIndex;
    setSelection({ vehicleId: selectedVehicle.id, index: nextIndex });
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ApplicationHeader active="garage" />
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="technical-label text-accent">Garage / Command center</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              My Garage
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              {vehicles.length === 1
                ? "01 vehicle in your collection"
                : `${String(vehicles.length).padStart(2, "0")} vehicles in your collection`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsFormOpen((isOpen) => !isOpen)}
            className="button-primary w-full sm:w-auto"
          >
            {isFormOpen ? (
              "Close form"
            ) : (
              <>
                <span aria-hidden="true">+</span> Add Vehicle
              </>
            )}
          </button>
        </header>

        {vehicles.length > 0 && (
          <section className="garage-overview" aria-label="Garage overview">
            <div className="garage-overview__item">
              <p className="technical-label">Vehicles</p>
              <p className="garage-overview__value">
                {String(vehicles.length).padStart(2, "0")}
              </p>
            </div>
            <div className="garage-overview__item">
              <p className="technical-label">Installed investment</p>
              <p className="garage-overview__value">
                {summaryError
                  ? "Unavailable"
                  : currencyFormatter.format(totalInstalledInvestment)}
              </p>
            </div>
            <div className="garage-overview__item">
              <p className="technical-label">Average tracked progress</p>
              <p className="garage-overview__value">
                {summaryError ? "Unavailable" : `${averageBuildProgress}%`}
              </p>
            </div>
          </section>
        )}

        {isFormOpen && (
          <AddVehicleModal onClose={() => setIsFormOpen(false)} />
        )}

        {selectedVehicle ? (
          <section aria-label="Your vehicles" className="garage-stage mt-8">
            <GarageVehicleCarousel
              vehicles={vehicles}
              selectedVehicleId={selectedVehicleId}
              modSummaries={modSummaries}
              summaryError={summaryError}
              onBeforeDelete={handleBeforeDelete}
              onSelectVehicle={(vehicleId) => {
                const index = vehicles.findIndex(
                  (vehicle) => vehicle.id === vehicleId,
                );
                if (index >= 0) setSelection({ vehicleId, index });
              }}
            />
          </section>
        ) : (
          <section className="garage-empty-state mt-8">
            <div className="garage-empty-state__mark" aria-hidden="true">
              01
            </div>
            <p className="technical-label mt-6 text-accent">
              Vehicle profile / ready
            </p>
            <h2 className="mt-3 text-xl font-semibold text-white sm:text-2xl">
              No vehicles in your garage
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">
              Add your first vehicle to start a build profile. VIN decoding can
              help fill in its year, make, model, and trim.
            </p>
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="button-primary mt-6 w-full sm:w-auto"
            >
              Add your first vehicle
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
