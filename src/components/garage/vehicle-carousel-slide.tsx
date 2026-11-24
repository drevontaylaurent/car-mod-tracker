import { VehicleCard } from "@/components/garage/vehicle-card";
import type { Vehicle } from "@/types/database";
import type { GarageModSummary } from "@/types/garage";

interface VehicleCarouselSlideProps {
  vehicle: Vehicle;
  position: number;
  total: number;
  summary?: GarageModSummary;
  summaryError?: string;
  isActive: boolean;
  onBeforeDelete: (vehicleId: string) => void;
}

export function VehicleCarouselSlide({
  vehicle,
  position,
  total,
  summary,
  summaryError,
  isActive,
  onBeforeDelete,
}: VehicleCarouselSlideProps) {
  return (
    <div
      className="garage-carousel__slide"
      data-vehicle-id={vehicle.id}
      role="group"
      aria-roledescription="slide"
      aria-label={`Vehicle ${position} of ${total}`}
      aria-hidden={!isActive}
      inert={!isActive}
    >
      <VehicleCard
        vehicle={vehicle}
        summary={summary}
        summaryError={summaryError}
        onBeforeDelete={() => onBeforeDelete(vehicle.id)}
      />
    </div>
  );
}
