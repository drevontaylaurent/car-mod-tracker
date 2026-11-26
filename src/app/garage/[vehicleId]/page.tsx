import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getVehicleMods } from "@/actions/mods";
import { getUserVehicle } from "@/actions/vehicles";
import { SignOutControl } from "@/components/auth/sign-out-control";
import { ApplicationHeader } from "@/components/layout/application-header";
import { VehicleBuildWorkspace } from "@/components/garage/vehicle-build-workspace";

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

  const vehicle = vehicleResult.data;
  const mods = modsResult.data;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ApplicationHeader />
      <div className="build-page__container mx-auto px-5 py-6 sm:px-8 sm:py-10">
        <div className="build-breadcrumb">
          <Link href="/garage" className="button-ghost build-breadcrumb__link">
            <span aria-hidden="true">←</span> Back to Garage
          </Link>
          <p className="technical-label">Garage / Vehicle build</p>
        </div>
        <VehicleBuildWorkspace
          vehicle={vehicle}
          mods={mods}
        />
      </div>
    </main>
  );
}

function BuildError({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
      <section className="surface-primary max-w-md p-8 text-center">
        <div className="mb-5 flex justify-end">
          <SignOutControl />
        </div>
        <h1 className="text-xl font-semibold">This build isn&apos;t available</h1>
        <p role="alert" className="mt-3 text-sm leading-6 text-zinc-400">
          {message}
        </p>
        <Link
          href="/garage"
          className="button-primary mt-6"
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
      className="flex min-h-screen items-center justify-center bg-background text-sm text-text-secondary"
    >
      Loading vehicle build...
    </main>
  );
}
