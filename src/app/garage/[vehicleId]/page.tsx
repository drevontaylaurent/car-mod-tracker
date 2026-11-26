import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getVehicleBuildPhases } from "@/actions/build-timeline";
import { getVehicleDiagnostics } from "@/actions/diagnostics";
import { getVehicleMods } from "@/actions/mods";
import { getUserVehicle } from "@/actions/vehicles";
import { SignOutControl } from "@/components/auth/sign-out-control";
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
  const [vehicleResult, modsResult, diagnosticsResult, phasesResult] =
    await Promise.all([
      getUserVehicle(vehicleId),
      getVehicleMods(vehicleId),
      getVehicleDiagnostics(vehicleId),
      getVehicleBuildPhases(vehicleId),
    ]);

  if (!vehicleResult.success) {
    return <BuildError message={vehicleResult.error} />;
  }
  if (!modsResult.success) {
    return <BuildError message={modsResult.error} />;
  }

  const vehicle = vehicleResult.data;
  const mods = modsResult.data;
  const diagnostics = diagnosticsResult.success
    ? diagnosticsResult.data
    : null;
  const diagnosticsError = diagnosticsResult.success
    ? null
    : diagnosticsResult.error;
  const phases = phasesResult.success ? phasesResult.data : null;
  const timelineError = phasesResult.success ? null : phasesResult.error;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <VehicleBuildWorkspace
        vehicle={vehicle}
        mods={mods}
        diagnostics={diagnostics}
        diagnosticsError={diagnosticsError}
        phases={phases}
        timelineError={timelineError}
      />
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
