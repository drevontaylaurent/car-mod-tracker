"use client";

import { useActionState } from "react";
import { createVehicle } from "@/actions/vehicles";

interface AddVehicleModalProps {
  onClose: () => void;
}

export function AddVehicleModal({ onClose }: AddVehicleModalProps) {
  const [state, formAction, isPending] = useActionState(createVehicle, undefined);
  const currentYear = new Date().getFullYear();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-vehicle-heading"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#131819] p-5 shadow-2xl shadow-black/50 sm:p-7"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2
              id="add-vehicle-heading"
              className="text-xl font-semibold text-white"
            >
              Add a vehicle
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Enter a VIN and any details you already know.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add vehicle dialog"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            ×
          </button>
        </div>

        <form action={formAction}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 sm:col-span-2">
              <span className="block text-sm font-medium text-zinc-200">VIN</span>
              <input
                name="vin"
                type="text"
                required
                minLength={17}
                maxLength={17}
                pattern="[A-HJ-NPR-Za-hj-npr-z0-9]{17}"
                title="Enter all 17 VIN characters, excluding I, O, and Q."
                autoCapitalize="characters"
                autoComplete="off"
                placeholder="17-character vehicle identification number"
                className="h-11 w-full rounded-lg border border-white/10 bg-[#0b0e0f] px-3 text-sm uppercase text-white outline-none placeholder:normal-case placeholder:text-zinc-600 focus:border-lime-400"
              />
            </label>
            <label className="space-y-2">
              <span className="block text-sm font-medium text-zinc-200">Year</span>
              <input
                name="year"
                type="number"
                min={1886}
                max={currentYear + 1}
                placeholder="e.g. 2022"
                className="h-11 w-full rounded-lg border border-white/10 bg-[#0b0e0f] px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-lime-400"
              />
            </label>
            <label className="space-y-2">
              <span className="block text-sm font-medium text-zinc-200">Make</span>
              <input
                name="make"
                maxLength={100}
                placeholder="e.g. Toyota"
                className="h-11 w-full rounded-lg border border-white/10 bg-[#0b0e0f] px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-lime-400"
              />
            </label>
            <label className="space-y-2">
              <span className="block text-sm font-medium text-zinc-200">Model</span>
              <input
                name="model"
                maxLength={100}
                placeholder="e.g. GR86"
                className="h-11 w-full rounded-lg border border-white/10 bg-[#0b0e0f] px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-lime-400"
              />
            </label>
            <label className="space-y-2">
              <span className="block text-sm font-medium text-zinc-200">Trim</span>
              <input
                name="trim"
                maxLength={100}
                placeholder="e.g. Premium"
                className="h-11 w-full rounded-lg border border-white/10 bg-[#0b0e0f] px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-lime-400"
              />
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className="block text-sm font-medium text-zinc-200">
                Nickname
              </span>
              <input
                name="nickname"
                maxLength={80}
                placeholder="Optional name for your build"
                className="h-11 w-full rounded-lg border border-white/10 bg-[#0b0e0f] px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-lime-400"
              />
            </label>
          </div>

          {state && !state.success && (
            <p role="alert" className="mt-4 text-sm text-red-300">
              {state.error}
            </p>
          )}
          {state?.success && (
            <p role="status" className="mt-4 text-sm text-lime-300">
              Vehicle added to your garage.
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-lg border border-white/10 px-4 text-sm font-medium text-zinc-300 transition hover:bg-white/5"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="h-11 rounded-lg bg-lime-400 px-5 text-sm font-semibold text-[#111513] transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Adding vehicle..." : "Save vehicle"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
