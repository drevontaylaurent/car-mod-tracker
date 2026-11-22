import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
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
  const result = await getUserVehicles();

  if (!result.success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0e0f] px-5 text-white">
        <section className="max-w-md rounded-2xl border border-white/10 bg-[#131819] p-8 text-center">
          <h1 className="text-xl font-semibold">Your garage isn&apos;t available</h1>
          <p role="alert" className="mt-3 text-sm leading-6 text-zinc-400">
            {result.error}
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex h-11 items-center rounded-lg bg-lime-400 px-5 text-sm font-semibold text-[#111513] transition hover:bg-lime-300"
          >
            Return to sign in
          </Link>
        </section>
      </main>
    );
  }

  return <GarageDashboard vehicles={result.data} />;
}

function GarageLoading() {
  return (
    <main
      role="status"
      className="flex min-h-screen items-center justify-center bg-[#0b0e0f] text-sm text-zinc-400"
    >
      Loading your garage...
    </main>
  );
}
