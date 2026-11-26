import type {
  DiagnosticSeverity,
  VehicleDiagnosticInsert,
} from "@/types/diagnostics";

interface DiagnosticInsertInput {
  vehicleId: string;
  userId: string;
  code: string;
  severity: DiagnosticSeverity;
}

export function buildDiagnosticInsert({
  vehicleId,
  userId,
  code,
  severity,
}: DiagnosticInsertInput): VehicleDiagnosticInsert & Record<string, unknown> {
  return {
    vehicle_id: vehicleId,
    user_id: userId,
    code,
    description: null,
    severity,
    status: "active",
    notes: null,
    resolved_at: null,
  };
}
