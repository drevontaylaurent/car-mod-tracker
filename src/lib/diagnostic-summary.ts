import type {
  DiagnosticSeverity,
  VehicleDiagnostic,
} from "@/types/diagnostics";

export interface DiagnosticSummary {
  totalCount: number;
  unresolvedCount: number;
  resolvedCount: number;
  resolutionPercent: number;
  highestUnresolvedSeverity: DiagnosticSeverity | null;
}

const SEVERITY_RANK: Record<DiagnosticSeverity, number> = {
  minor: 1,
  critical: 2,
};

export function getDiagnosticSummary(
  diagnostics: readonly VehicleDiagnostic[],
): DiagnosticSummary {
  const resolvedCount = diagnostics.filter(
    (diagnostic) => diagnostic.status === "resolved",
  ).length;
  const unresolved = diagnostics.filter(
    (diagnostic) => diagnostic.status !== "resolved",
  );
  const highestUnresolvedSeverity = unresolved.reduce<
    DiagnosticSeverity | null
  >((highest, diagnostic) => {
    if (
      highest === null ||
      SEVERITY_RANK[diagnostic.severity] > SEVERITY_RANK[highest]
    ) {
      return diagnostic.severity;
    }
    return highest;
  }, null);

  return {
    totalCount: diagnostics.length,
    unresolvedCount: unresolved.length,
    resolvedCount,
    resolutionPercent:
      diagnostics.length === 0
        ? 0
        : Math.round((resolvedCount / diagnostics.length) * 100),
    highestUnresolvedSeverity,
  };
}
