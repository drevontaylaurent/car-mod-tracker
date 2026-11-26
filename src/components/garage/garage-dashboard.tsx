"use client";

import { useState } from "react";
import { AddVehicleModal } from "@/components/garage/add-vehicle-modal";
import { GarageBottomNavigation } from "@/components/garage/garage-bottom-navigation";
import { GarageFleetSummary } from "@/components/garage/garage-fleet-summary";
import { GarageHomeHeader } from "@/components/garage/garage-home-header";
import { GarageVehicleCarousel } from "@/components/garage/garage-vehicle-carousel";
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

  const handleBeforeDelete = (vehicleId: string) => {
    const deletedIndex = vehicles.findIndex((vehicle) => vehicle.id === vehicleId);
    const nextIndex =
      deletedIndex >= 0 && deletedIndex < selectedIndex
        ? selectedIndex - 1
        : selectedIndex;
    setSelection({ vehicleId: selectedVehicle?.id ?? "", index: nextIndex });
  };

  return (
    <main className="garage-hub">
      <GarageHomeHeader onAddVehicle={() => setIsFormOpen(true)} />

      <div className="garage-hub__content">
        <GarageFleetSummary
          vehicles={vehicles}
          modSummaries={modSummaries}
          summaryError={summaryError}
        />

        <section aria-labelledby="garage-collection-heading" className="garage-collection">
          <header className="garage-collection__header">
            <div>
              <h1 id="garage-collection-heading">Your Garage</h1>
              <p>Swipe collection <span aria-hidden="true">•</span> Tap vehicle to open build</p>
            </div>
            <span className="garage-collection__count">
              {vehicles.length} {vehicles.length === 1 ? "bay" : "bays"}
            </span>
          </header>

          {selectedVehicle ? (
            <GarageVehicleCarousel
              vehicles={vehicles}
              selectedVehicleId={selectedVehicle.id}
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
          ) : (
            <div className="garage-hub-empty">
              <div className="garage-hub-empty__mark" aria-hidden="true">01</div>
              <p className="technical-label text-accent">Garage / Ready for intake</p>
              <h2>No vehicles in your garage</h2>
              <p>Add your first vehicle to begin tracking its build.</p>
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="button-primary"
              >
                <span aria-hidden="true">+</span> Add Vehicle
              </button>
            </div>
          )}
        </section>
      </div>

      <GarageBottomNavigation />
      {isFormOpen && <AddVehicleModal onClose={() => setIsFormOpen(false)} />}
    </main>
  );
}
