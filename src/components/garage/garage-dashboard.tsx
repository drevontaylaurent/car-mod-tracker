"use client";

import { useState } from "react";
import type { Vehicle } from "@/types/database";
import { VehicleCard } from "@/components/garage/vehicle-card";
import { AddVehicleModal } from "@/components/garage/add-vehicle-modal";
import { ApplicationHeader } from "@/components/layout/application-header";
import type { GarageModSummary } from "@/types/garage";

interface GarageDashboardProps {
  vehicles: Vehicle[];
  modSummaries?: GarageModSummary[];
  summaryError?: string;
}

export function GarageDashboard({
  vehicles,
  modSummaries = [],
  summaryError,
}: GarageDashboardProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const summariesByVehicleId = new Map(
    modSummaries.map((summary) => [summary.vehicleId, summary]),
  );

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
            {isFormOpen ? "Close form" : "Add Vehicle"}
          </button>
        </header>

        {isFormOpen && (
          <AddVehicleModal onClose={() => setIsFormOpen(false)} />
        )}

        {vehicles.length > 0 ? (
          <section
            aria-label="Your vehicles"
            className="mt-8 grid gap-6"
          >
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                summary={summariesByVehicleId.get(vehicle.id)}
                summaryError={summaryError}
              />
            ))}
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
