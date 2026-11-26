import { getBuildStatus } from "@/lib/build-status";
import type { Mod } from "@/types/database";

export function BuildStatusPill({ mods }: { mods: readonly Mod[] }) {
  const status = getBuildStatus(mods);

  return (
    <p className="open-build__status-pill" data-status={status.id}>
      <span className="open-build__status-dot" aria-hidden="true" />
      <span className="sr-only">Build status: </span>
      {status.label}
    </p>
  );
}
