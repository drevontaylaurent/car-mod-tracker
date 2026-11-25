"use client";

import type { GarageModSummary } from "@/types/garage";
import { VehicleCarouselSlide } from "@/components/garage/vehicle-carousel-slide";
import { useGarageVehicleCarousel } from "@/components/garage/use-garage-vehicle-carousel";
import type { VehicleWithMedia } from "@/types/vehicle-media";

interface GarageVehicleCarouselProps {
  vehicles: VehicleWithMedia[];
  selectedVehicleId: string;
  modSummaries: GarageModSummary[];
  summaryError?: string;
  onBeforeDelete: (vehicleId: string) => void;
  onSelectVehicle: (vehicleId: string) => void;
}

export function GarageVehicleCarousel({
  vehicles,
  selectedVehicleId,
  modSummaries,
  summaryError,
  onBeforeDelete,
  onSelectVehicle,
}: GarageVehicleCarouselProps) {
  const {
    viewportRef,
    selectedIndex,
    moveBy,
    handleScroll,
  } = useGarageVehicleCarousel({
    vehicles,
    selectedVehicleId,
    onSelectVehicle,
  });
  const summariesByVehicleId = new Map(
    modSummaries.map((summary) => [summary.vehicleId, summary]),
  );

  return (
    <section
      className="garage-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Garage vehicle selection"
    >
      <div className="garage-carousel__controls" role="group" aria-label="Carousel controls">
        {vehicles.length > 1 && (
          <button
            type="button"
            className="garage-carousel__control"
            aria-label="Previous vehicle"
            onClick={() => moveBy(-1)}
          >
            <span aria-hidden="true">←</span> Previous
          </button>
        )}
        <p
          className="garage-carousel__position"
          aria-live="polite"
          aria-atomic="true"
        >
          VEHICLE {selectedIndex + 1} / {vehicles.length}
        </p>
        {vehicles.length > 1 && (
          <button
            type="button"
            className="garage-carousel__control"
            aria-label="Next vehicle"
            onClick={() => moveBy(1)}
          >
            Next <span aria-hidden="true">→</span>
          </button>
        )}
      </div>

      <div
        ref={viewportRef}
        className="garage-carousel__viewport"
        onScroll={handleScroll}
      >
        <div className="garage-carousel__track">
          {vehicles.map((vehicle, index) => (
            <VehicleCarouselSlide
              key={vehicle.id}
              vehicle={vehicle}
              position={index + 1}
              total={vehicles.length}
              summary={summariesByVehicleId.get(vehicle.id)}
              summaryError={summaryError}
              onBeforeDelete={onBeforeDelete}
              isActive={vehicle.id === selectedVehicleId}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
