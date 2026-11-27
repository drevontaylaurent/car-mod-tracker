import type { ActionResult } from "@/types/actions";

export const DIAGNOSTIC_STATUSES = [
  "active",
  "pending",
  "resolved",
] as const;

export type DiagnosticStatus = (typeof DIAGNOSTIC_STATUSES)[number];

export const DIAGNOSTIC_SEVERITIES = ["critical", "minor"] as const;

export type DiagnosticSeverity = (typeof DIAGNOSTIC_SEVERITIES)[number];

export interface VehicleDiagnostic {
  id: string;
  vehicle_id: string;
  user_id: string;
  code: string;
  description?: string | null;
  status: DiagnosticStatus;
  severity: DiagnosticSeverity;
  notes: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface VehicleDiagnosticInsert {
  id?: string;
  vehicle_id: string;
  user_id: string;
  code: string;
  description?: string | null;
  status?: DiagnosticStatus;
  severity: DiagnosticSeverity;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  resolved_at?: string | null;
}

export type VehicleDiagnosticUpdate = Partial<
  Pick<
    VehicleDiagnostic,
    "code" | "status" | "severity" | "notes" | "updated_at" | "resolved_at"
  >
>;

export interface CreateDiagnosticInput {
  vehicleId: string;
  code: string;
  severity: DiagnosticSeverity;
}

export interface UpdateDiagnosticInput {
  vehicleId: string;
  diagnosticId: string;
  code?: string;
  status?: DiagnosticStatus;
  severity?: DiagnosticSeverity;
  notes?: string | null;
}

export type DiagnosticActionResponse = ActionResult<VehicleDiagnostic>;
export type DiagnosticListActionResponse = ActionResult<VehicleDiagnostic[]>;
export type DiagnosticDeleteActionResponse = ActionResult<null>;
