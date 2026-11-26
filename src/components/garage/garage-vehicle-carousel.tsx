"use client";

import { VehicleCarouselSlide } from "@/components/garage/vehicle-carousel-slide";
import { useGarageVehicleCarousel } from "@/components/garage/use-garage-vehicle-carousel";
import type { GarageModSummary } from "@/types/garage";
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
  const { viewportRef, selectedIndex, moveBy, handleScroll } =
    useGarageVehicleCarousel({
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

      {vehicles.length > 1 && (
        <div className="garage-carousel__navigation">
          <button
            type="button"
            aria-label="Previous vehicle"
            className="garage-carousel__arrow"
            onClick={() => moveBy(-1)}
          >
            <span aria-hidden="true">←</span>
          </button>
          <div className="garage-carousel__indicators" aria-label="Choose vehicle">
            {vehicles.map((vehicle, index) => (
              <button
                key={vehicle.id}
                type="button"
                className="garage-carousel__indicator"
                aria-label={`Show vehicle ${index + 1} of ${vehicles.length}`}
                aria-current={index === selectedIndex ? "true" : undefined}
                onClick={() => onSelectVehicle(vehicle.id)}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next vehicle"
            className="garage-carousel__arrow"
            onClick={() => moveBy(1)}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </section>
  );
}
