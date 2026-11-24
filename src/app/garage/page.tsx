import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getGarageModSummaries } from "@/actions/mods";
import { getUserVehicles } from "@/actions/vehicles";
import { GarageDashboard } from "@/components/garage/garage-dashboard";

export default function GaragePage() {
  return (
    <Suspense fallback={<GarageLoading />}>
      <GarageContent />
    </Suspense>
  );
}

async function GarageContent() {
  await connection();
  const [result, summaryResult] = await Promise.all([
    getUserVehicles(),
    getGarageModSummaries(),
  ]);

  if (!result.success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5 text-white">
        <section className="surface-primary max-w-md p-8 text-center">
          <h1 className="text-xl font-semibold">Your garage isn&apos;t available</h1>
          <p role="alert" className="mt-3 text-sm leading-6 text-zinc-400">
            {result.error}
          </p>
          <Link
            href="/login"
            className="button-primary mt-6"
          >
            Return to sign in
          </Link>
        </section>
      </main>
    );
  }

  return (
    <GarageDashboard
      vehicles={result.data}
      modSummaries={summaryResult.success ? summaryResult.data : []}
      summaryError={summaryResult.success ? undefined : summaryResult.error}
    />
  );
}

function GarageLoading() {
  return (
    <main
      role="status"
      className="flex min-h-screen items-center justify-center bg-background text-sm text-zinc-400"
    >
      Loading your garage...
    </main>
  );
}
