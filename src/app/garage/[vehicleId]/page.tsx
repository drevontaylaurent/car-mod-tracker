import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getVehicleMods } from "@/actions/mods";
import { getUserVehicle } from "@/actions/vehicles";
import { AddModForm } from "@/components/mods/add-mod-form";
import { BuildSummary } from "@/components/mods/build-summary";
import { ModList } from "@/components/mods/mod-list";
import type { Vehicle } from "@/types/database";

export default function VehicleBuildPage({
  params,
}: PageProps<"/garage/[vehicleId]">) {
  return (
    <Suspense fallback={<BuildLoading />}>
      <VehicleBuildContent params={params} />
    </Suspense>
  );
}

async function VehicleBuildContent({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  await connection();
  const { vehicleId } = await params;
  const [vehicleResult, modsResult] = await Promise.all([
    getUserVehicle(vehicleId),
    getVehicleMods(vehicleId),
  ]);

  if (!vehicleResult.success) {
    return <BuildError message={vehicleResult.error} />;
  }
  if (!modsResult.success) {
    return <BuildError message={modsResult.error} />;
  }

  return (
    <main className="min-h-screen bg-[#0b0e0f] px-5 py-8 text-white sm:px-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/garage"
          className="inline-flex text-sm font-medium text-lime-300 transition hover:text-lime-200"
        >
          ← Back to garage
        </Link>
        <VehicleDetails vehicle={vehicleResult.data} />
        <div className="mt-8">
          <BuildSummary mods={modsResult.data} />
        </div>
        <div className="mt-8">
          <AddModForm vehicleId={vehicleResult.data.id} />
        </div>
        <div className="mt-10">
          <ModList mods={modsResult.data} />
        </div>
      </div>
    </main>
  );
}

function VehicleDetails({ vehicle }: { vehicle: Vehicle }) {
  const title =
    vehicle.nickname ||
    [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ") ||
    "Vehicle build";

  return (
    <header className="mt-6 rounded-2xl border border-white/10 bg-[#131819] p-5 sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-300">
        Vehicle build
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 text-sm text-zinc-300">
        {[vehicle.year, vehicle.make, vehicle.model, vehicle.trim]
          .filter(Boolean)
          .join(" ") || "Build details coming soon"}
      </p>
      <div className="mt-5 border-t border-white/5 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          VIN
        </p>
        <p className="mt-1 break-all font-mono text-sm tracking-wide text-zinc-300">
          {vehicle.vin}
        </p>
      </div>
    </header>
  );
}

function BuildError({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0e0f] px-5 text-white">
      <section className="max-w-md rounded-2xl border border-white/10 bg-[#131819] p-8 text-center">
        <h1 className="text-xl font-semibold">This build isn&apos;t available</h1>
        <p role="alert" className="mt-3 text-sm leading-6 text-zinc-400">
          {message}
        </p>
        <Link
          href="/garage"
          className="mt-6 inline-flex h-11 items-center rounded-lg bg-lime-400 px-5 text-sm font-semibold text-[#111513] transition hover:bg-lime-300"
        >
          Return to garage
        </Link>
      </section>
    </main>
  );
}

function BuildLoading() {
  return (
    <main
      role="status"
      className="flex min-h-screen items-center justify-center bg-[#0b0e0f] text-sm text-zinc-400"
    >
      Loading vehicle build...
    </main>
  );
}
