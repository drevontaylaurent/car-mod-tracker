import type { BuildPhase } from "@/types/build-timeline";

export function getPhaseTitle(phase: Pick<BuildPhase, "name" | "position">): string {
  const isGenericName = /^phase\s*\d+$/i.test(phase.name.trim());
  return isGenericName
    ? `Phase ${phase.position}`
    : `Phase ${phase.position} — ${phase.name}`;
}
