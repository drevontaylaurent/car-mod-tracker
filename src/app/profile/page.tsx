import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getGarageModSummaries } from "@/actions/mods";
import { getProfileIdentity } from "@/actions/sharing";
import { getUserVehicles } from "@/actions/vehicles";
import { ProfileDashboard } from "@/components/profile/profile-dashboard";

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfileContent />
    </Suspense>
  );
}

async function ProfileContent() {
  await connection();
  const [identity, vehicles, summaries] = await Promise.all([
    getProfileIdentity(),
    getUserVehicles(),
    getGarageModSummaries(),
  ]);

  if (!identity.success || !vehicles.success) {
    const error = !identity.success ? identity.error : !vehicles.success ? vehicles.error : "";
    return (
      <main className="profile-page profile-page--centered">
        <section className="surface-primary max-w-md p-7 text-center">
          <h1 className="text-xl font-semibold">Profile unavailable</h1>
          <p role="alert" className="mt-3 text-sm text-zinc-400">
            {error}
          </p>
          <Link href="/garage" className="button-primary mt-5">
            Return to Garage
          </Link>
        </section>
      </main>
    );
  }

  return (
    <ProfileDashboard
      identity={identity.data.label}
      vehicles={vehicles.data}
      modSummaries={summaries.success ? summaries.data : []}
      summaryError={summaries.success ? undefined : summaries.error}
    />
  );
}

function ProfileLoading() {
  return (
    <main className="profile-page profile-page--centered" role="status">
      Loading builder profile...
    </main>
  );
}
