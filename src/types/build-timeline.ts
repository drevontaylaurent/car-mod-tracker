import type { ActionResult } from "@/types/actions";

export const BUILD_PHASE_STATUSES = [
  "planned",
  "in_progress",
  "completed",
] as const;

export type BuildPhaseStatus = (typeof BUILD_PHASE_STATUSES)[number];

export interface BuildPhase {
  id: string;
  vehicle_id: string;
  user_id: string;
  name: string;
  description: string | null;
  position: number;
  status: BuildPhaseStatus;
  target_completion_date: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface BuildPhaseInsert {
  id?: string;
  vehicle_id: string;
  user_id: string;
  name: string;
  description?: string | null;
  position: number;
  status?: BuildPhaseStatus;
  target_completion_date?: string | null;
  created_at?: string;
  updated_at?: string;
  completed_at?: string | null;
}

export type BuildPhaseUpdate = Partial<
  Pick<
    BuildPhase,
    | "name"
    | "description"
    | "position"
    | "status"
    | "target_completion_date"
    | "updated_at"
    | "completed_at"
  >
>;

export interface CreateBuildPhaseInput {
  vehicleId: string;
  name: string;
  description: string | null;
  targetCompletionDate: string | null;
}

export interface UpdateBuildPhaseInput {
  vehicleId: string;
  phaseId: string;
  name?: string;
  description?: string | null;
  targetCompletionDate?: string | null;
}

export type BuildPhaseActionResponse = ActionResult<BuildPhase>;
export type BuildPhaseListActionResponse = ActionResult<BuildPhase[]>;
export type BuildPhaseDeleteActionResponse = ActionResult<null>;
