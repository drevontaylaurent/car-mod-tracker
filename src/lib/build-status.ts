import type { Mod } from "@/types/database";

export type BuildStatusId = "planning" | "in-progress" | "complete";

export interface BuildStatus {
  id: BuildStatusId;
  label: string;
}

export function getBuildStatus(mods: readonly Mod[]): BuildStatus {
  const installedCount = mods.filter((mod) => mod.status === "Installed").length;

  if (installedCount === 0) {
    return { id: "planning", label: "Planning" };
  }
  if (installedCount === mods.length) {
    return { id: "complete", label: "Complete" };
  }
  return { id: "in-progress", label: "In Progress" };
}
