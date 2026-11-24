import type { Mod } from "@/types/database";

export interface BuildTelemetry {
  totalModCount: number;
  installedCount: number;
  orderedCount: number;
  wishlistCount: number;
  installedCost: number;
  plannedCost: number;
  progress: number;
}

export function getBuildTelemetry(mods: readonly Mod[]): BuildTelemetry {
  const telemetry: BuildTelemetry = {
    totalModCount: mods.length,
    installedCount: 0,
    orderedCount: 0,
    wishlistCount: 0,
    installedCost: 0,
    plannedCost: 0,
    progress: 0,
  };

  for (const mod of mods) {
    if (mod.status === "Installed") {
      telemetry.installedCount += 1;
      telemetry.installedCost += mod.cost;
    } else {
      telemetry.plannedCost += mod.cost;
      if (mod.status === "Ordered") {
        telemetry.orderedCount += 1;
      } else {
        telemetry.wishlistCount += 1;
      }
    }
  }

  telemetry.progress =
    telemetry.totalModCount === 0
      ? 0
      : Math.round((telemetry.installedCount / telemetry.totalModCount) * 100);

  return telemetry;
}
