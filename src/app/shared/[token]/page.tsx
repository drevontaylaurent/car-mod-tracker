import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getSharedBuild } from "@/actions/sharing";
import { VehicleVisual } from "@/components/garage/vehicle-visual";

interface SharedBuildPageProps {
  params: Promise<{ token: string }>;
}

export default function SharedBuildPage({
  params,
}: SharedBuildPageProps) {
  return (
    <Suspense fallback={<SharedBuildLoading />}>
      <SharedBuildContent params={params} />
    </Suspense>
  );
}

async function SharedBuildContent({
  params,
}: SharedBuildPageProps) {
  const { token } = await params;
  const result = await getSharedBuild(token);
  if (!result.success) notFound();

  const build = result.data;
  const title =
    build.nickname ||
    [build.year, build.make, build.model].filter(Boolean).join(" ") ||
    "Shared Vehicle";
  const identity = [build.year, build.make, build.model, build.trim]
    .filter(Boolean)
    .join(" ");

  return (
    <main className="shared-build-page">
      <header className="shared-build-header">
        <p>Car Mod Tracker</p>
        <span>Shared Build</span>
      </header>
      <article className="shared-build-card">
        <div className="shared-build-card__visual">
          <VehicleVisual vehicleName={title} photoUrl={null} />
        </div>
        <div className="shared-build-card__content">
          <p className="technical-label text-accent">Read-only vehicle profile</p>
          <h1>{title}</h1>
          <p className="shared-build-card__identity">{identity}</p>

          <section className="shared-build-progress" aria-label="Build progress">
            <div>
              <span>Tracked Build Progress</span>
              <strong>{build.progress}%</strong>
            </div>
            <div
              role="progressbar"
              aria-label="Tracked modifications installed"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={build.progress}
            >
              <span style={{ width: `${build.progress}%` }} />
            </div>
            <p>{build.installedCount} of {build.totalModCount} modifications installed</p>
          </section>

          <section className="shared-build-mods" aria-labelledby="shared-mods-heading">
            <div className="profile-section-heading">
              <h2 id="shared-mods-heading">Build Inventory</h2>
              <span>{build.totalModCount} tracked</span>
            </div>
            {build.modifications.length > 0 ? (
              <ul>
                {build.modifications.map((mod, index) => (
                  <li key={`${mod.name}-${index}`}>
                    <div>
                      <strong>{mod.name}</strong>
                      <span>{mod.category}</span>
                    </div>
                    <span data-status={mod.status.toLowerCase()}>{mod.status}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="shared-build-mods__empty">No tracked modifications yet.</p>
            )}
          </section>
          <p className="shared-build-card__privacy">
            Shared by the vehicle owner. Costs, VIN, account details, diagnostics,
            and management controls are private.
          </p>
        </div>
      </article>
    </main>
  );
}

function SharedBuildLoading() {
  return (
    <main className="profile-page profile-page--centered" role="status">
      Loading shared build...
    </main>
  );
}
