"use client";

import { useState } from "react";
import type { Vehicle } from "@/types/database";
import { VehicleCard } from "@/components/garage/vehicle-card";
import { AddVehicleModal } from "@/components/garage/add-vehicle-modal";

interface GarageDashboardProps {
  vehicles: Vehicle[];
}

export function GarageDashboard({ vehicles }: GarageDashboardProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#0b0e0f] px-5 py-10 text-white sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-lime-300">
              Car Mod Tracker
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Your garage
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              {vehicles.length === 1
                ? "1 vehicle in your collection"
                : `${vehicles.length} vehicles in your collection`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsFormOpen((isOpen) => !isOpen)}
            className="h-11 rounded-lg bg-lime-400 px-5 text-sm font-semibold text-[#111513] transition hover:bg-lime-300"
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
            className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
          >
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </section>
        ) : (
          <section className="mt-8 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center sm:py-20">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-lime-400/20 bg-lime-400/10 text-2xl text-lime-300">
              +
            </div>
            <h2 className="mt-5 text-xl font-semibold text-white">
              Your garage is ready
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">
              Add your first vehicle to keep its build details, upgrades, and
              notes all in one place.
            </p>
            {!isFormOpen && (
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="mt-6 h-11 rounded-lg bg-lime-400 px-5 text-sm font-semibold text-[#111513] transition hover:bg-lime-300"
              >
                Add Vehicle
              </button>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
