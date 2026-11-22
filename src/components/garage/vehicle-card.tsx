"use client";

import { useActionState } from "react";
import Link from "next/link";
import { deleteVehicle } from "@/actions/vehicles";
import type { Vehicle } from "@/types/database";

interface VehicleCardProps {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const [state, formAction, isPending] = useActionState(deleteVehicle, undefined);
  const title =
    vehicle.nickname ||
    [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ") ||
    "Vehicle";

  return (
    <article className="flex min-h-56 flex-col rounded-2xl border border-white/10 bg-[#131819] p-5 transition hover:border-lime-400/30 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime-300">
            Vehicle
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            <Link
              href={`/garage/${vehicle.id}`}
              className="transition hover:text-lime-300"
            >
              {title}
            </Link>
          </h2>
          {vehicle.nickname && (
            <p className="mt-1 text-sm text-zinc-400">
              {[vehicle.year, vehicle.make, vehicle.model, vehicle.trim]
                .filter(Boolean)
                .join(" ") || "Build details coming soon"}
            </p>
          )}
        </div>
        <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-zinc-400">
          {vehicle.year ?? "Year N/A"}
        </span>
      </div>

      <div className="mt-6 border-t border-white/5 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          VIN
        </p>
        <p className="mt-1 break-all font-mono text-sm tracking-wide text-zinc-300">
          {vehicle.vin}
        </p>
      </div>

      <div className="mt-auto pt-5">
        <Link
          href={`/garage/${vehicle.id}`}
          className="mb-4 inline-flex text-sm font-semibold text-lime-300 transition hover:text-lime-200"
        >
          Open build
        </Link>
        {state && !state.success && (
          <p role="alert" className="mb-3 text-sm text-red-300">
            {state.error}
          </p>
        )}
        <form action={formAction}>
          <input type="hidden" name="vehicleId" value={vehicle.id} />
          <button
            type="submit"
            disabled={isPending}
            className="text-sm font-medium text-zinc-500 transition hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Removing..." : "Remove vehicle"}
          </button>
        </form>
      </div>
    </article>
  );
}
