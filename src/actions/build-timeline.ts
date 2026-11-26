"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/actions";
import {
  BUILD_PHASE_STATUSES,
  type BuildPhase,
  type BuildPhaseActionResponse,
  type BuildPhaseDeleteActionResponse,
  type BuildPhaseListActionResponse,
  type BuildPhaseStatus,
  type BuildPhaseUpdate,
  type CreateBuildPhaseInput,
  type UpdateBuildPhaseInput,
} from "@/types/build-timeline";
import type { Mod } from "@/types/database";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;
type AuthContext = { supabase: SupabaseClient; userId: string };
type BuildPhaseFormState = BuildPhaseActionResponse | undefined;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value.trim());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBuildPhaseStatus(value: string): value is BuildPhaseStatus {
  return BUILD_PHASE_STATUSES.some((status) => status === value);
}

function timelineStorageError(error: { code?: string }, fallback: string): string {
  if (
    error.code === "PGRST205" ||
    error.code === "PGRST204" ||
    error.code === "42P01" ||
    error.code === "42703"
  ) {
    return "Build Timeline storage is unavailable. Apply the build phases migration to enable it.";
  }
  return fallback;
}

async function getAuthContext(): Promise<ActionResult<AuthContext>> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Could not verify the current user for a Build Timeline action.", error);
    return {
      success: false,
      error: "Unable to verify your session. Please try again.",
    };
  }
  if (!user) {
    return {
      success: false,
      error: "Sign in to manage this Build Timeline.",
    };
  }

  return { success: true, data: { supabase, userId: user.id } };
}

async function verifyVehicleOwnership(
  supabase: SupabaseClient,
  vehicleId: string,
  userId: string,
): Promise<ActionResult<null>> {
  const { data, error } = await supabase
    .from("vehicles")
    .select("id")
    .eq("id", vehicleId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Could not verify vehicle ownership for a Build Timeline action.", error);
    return {
      success: false,
      error: "Could not verify this vehicle. Please try again.",
    };
  }
  if (!data) {
    return { success: false, error: "Vehicle not found in your garage." };
  }

  return { success: true, data: null };
}

async function getOwnedPhase(
  supabase: SupabaseClient,
  vehicleId: string,
  phaseId: string,
  userId: string,
): Promise<ActionResult<BuildPhase>> {
  const { data, error } = await supabase
    .from("build_phases")
    .select("*")
    .eq("id", phaseId)
    .eq("vehicle_id", vehicleId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Could not load the owned build phase.", error);
    return {
      success: false,
      error: timelineStorageError(
        error,
        "Could not verify this build phase. Please try again.",
      ),
    };
  }
  if (!data) {
    return { success: false, error: "Build phase not found." };
  }

  return { success: true, data };
}

function readRequiredText(
  formData: FormData,
  key: string,
  label: string,
  maximumLength: number,
): ActionResult<string> {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim().length === 0) {
    return { success: false, error: `${label} is required.` };
  }
  const normalized = value.trim();
  if (normalized.length > maximumLength) {
    return {
      success: false,
      error: `${label} must be ${maximumLength} characters or fewer.`,
    };
  }
  return { success: true, data: normalized };
}

function readOptionalText(
  value: unknown,
  label: string,
  maximumLength: number,
): ActionResult<string | null> {
  if (value === null || value === undefined || value === "") {
    return { success: true, data: null };
  }
  if (typeof value !== "string") {
    return { success: false, error: `Enter a valid ${label.toLowerCase()}.` };
  }
  const normalized = value.trim();
  if (normalized.length > maximumLength) {
    return {
      success: false,
      error: `${label} must be ${maximumLength} characters or fewer.`,
    };
  }
  return { success: true, data: normalized || null };
}

function parseOptionalDate(value: unknown): ActionResult<string | null> {
  if (value === null || value === undefined || value === "") {
    return { success: true, data: null };
  }
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { success: false, error: "Enter a valid target completion date." };
  }
  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== value
  ) {
    return { success: false, error: "Enter a valid target completion date." };
  }
  return { success: true, data: value };
}

function parseCreatePhase(formData: FormData): ActionResult<CreateBuildPhaseInput> {
  const vehicleId = formData.get("vehicleId");
  if (!isUuid(vehicleId)) {
    return { success: false, error: "Select a valid vehicle." };
  }

  const name = readRequiredText(formData, "name", "Phase name", 100);
  if (!name.success) {
    return name;
  }
  const description = readOptionalText(
    formData.get("description"),
    "Description",
    1500,
  );
  if (!description.success) {
    return description;
  }
  const targetCompletionDate = parseOptionalDate(
    formData.get("targetCompletionDate"),
  );
  if (!targetCompletionDate.success) {
    return targetCompletionDate;
  }

  return {
    success: true,
    data: {
      vehicleId: vehicleId.trim(),
      name: name.data,
      description: description.data,
      targetCompletionDate: targetCompletionDate.data,
    },
  };
}

function parseUpdatePhase(value: unknown): ActionResult<UpdateBuildPhaseInput> {
  if (!isRecord(value) || !isUuid(value.vehicleId) || !isUuid(value.phaseId)) {
    return { success: false, error: "Build phase not found." };
  }

  const input: UpdateBuildPhaseInput = {
    vehicleId: value.vehicleId.trim(),
    phaseId: value.phaseId.trim(),
  };
  let hasUpdate = false;

  if (value.name !== undefined) {
    if (typeof value.name !== "string" || value.name.trim().length === 0) {
      return { success: false, error: "Phase name is required." };
    }
    const name = value.name.trim();
    if (name.length > 100) {
      return {
        success: false,
        error: "Phase name must be 100 characters or fewer.",
      };
    }
    input.name = name;
    hasUpdate = true;
  }

  if (value.description !== undefined) {
    const description = readOptionalText(value.description, "Description", 1500);
    if (!description.success) {
      return description;
    }
    input.description = description.data;
    hasUpdate = true;
  }

  if (value.targetCompletionDate !== undefined) {
    const targetCompletionDate = parseOptionalDate(value.targetCompletionDate);
    if (!targetCompletionDate.success) {
      return targetCompletionDate;
    }
    input.targetCompletionDate = targetCompletionDate.data;
    hasUpdate = true;
  }

  if (!hasUpdate) {
    return { success: false, error: "Change at least one phase detail." };
  }
  return { success: true, data: input };
}

async function savePhaseChanges(
  supabase: SupabaseClient,
  vehicleId: string,
  phaseId: string,
  userId: string,
  changes: BuildPhaseUpdate,
): Promise<BuildPhaseActionResponse> {
  const { data, error } = await supabase
    .from("build_phases")
    .update(changes)
    .eq("id", phaseId)
    .eq("vehicle_id", vehicleId)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("Could not update build phase.", error);
    return {
      success: false,
      error: timelineStorageError(
        error,
        "Could not update this build phase. Please try again.",
      ),
    };
  }
  if (!data) {
    return { success: false, error: "Build phase not found." };
  }
  return { success: true, data };
}

export async function getVehicleBuildPhases(
  vehicleId: string,
): Promise<BuildPhaseListActionResponse> {
  if (!isUuid(vehicleId)) {
    return { success: false, error: "Vehicle not found in your garage." };
  }

  try {
    const auth = await getAuthContext();
    if (!auth.success) {
      return auth;
    }
    const normalizedVehicleId = vehicleId.trim();
    const ownership = await verifyVehicleOwnership(
      auth.data.supabase,
      normalizedVehicleId,
      auth.data.userId,
    );
    if (!ownership.success) {
      return ownership;
    }

    const { data, error } = await auth.data.supabase
      .from("build_phases")
      .select("*")
      .eq("vehicle_id", normalizedVehicleId)
      .eq("user_id", auth.data.userId)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      console.error("Could not load vehicle build phases.", error);
      return {
        success: false,
        error: timelineStorageError(
          error,
          "Could not load Build Timeline phases. Please try again.",
        ),
      };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Build Timeline phase lookup failed.", error);
    return {
      success: false,
      error: "Could not load Build Timeline phases. Please try again.",
    };
  }
}

export async function createBuildPhase(
  _previousState: BuildPhaseFormState,
  formData: FormData,
): Promise<BuildPhaseActionResponse> {
  const parsed = parseCreatePhase(formData);
  if (!parsed.success) {
    return parsed;
  }

  try {
    const auth = await getAuthContext();
    if (!auth.success) {
      return auth;
    }
    const ownership = await verifyVehicleOwnership(
      auth.data.supabase,
      parsed.data.vehicleId,
      auth.data.userId,
    );
    if (!ownership.success) {
      return ownership;
    }

    const { data: lastPhase, error: positionError } = await auth.data.supabase
      .from("build_phases")
      .select("position")
      .eq("vehicle_id", parsed.data.vehicleId)
      .eq("user_id", auth.data.userId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (positionError) {
      console.error("Could not determine the next build phase position.", positionError);
      return {
        success: false,
        error: timelineStorageError(
          positionError,
          "Could not create this build phase. Please try again.",
        ),
      };
    }

    const { data, error } = await auth.data.supabase
      .from("build_phases")
      .insert({
        vehicle_id: parsed.data.vehicleId,
        user_id: auth.data.userId,
        name: parsed.data.name,
        description: parsed.data.description,
        position: (lastPhase?.position ?? -1) + 1,
        status: "planned",
        target_completion_date: parsed.data.targetCompletionDate,
        completed_at: null,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Could not create vehicle build phase.", error);
      return {
        success: false,
        error: timelineStorageError(
          error,
          "Could not create this build phase. Please try again.",
        ),
      };
    }
    revalidatePath(`/garage/${parsed.data.vehicleId}`);
    return { success: true, data };
  } catch (error) {
    console.error("Build phase creation failed.", error);
    return {
      success: false,
      error: "Could not create this build phase. Please try again.",
    };
  }
}

export async function updateBuildPhase(
  value: UpdateBuildPhaseInput,
): Promise<BuildPhaseActionResponse> {
  const parsed = parseUpdatePhase(value);
  if (!parsed.success) {
    return parsed;
  }

  try {
    const auth = await getAuthContext();
    if (!auth.success) {
      return auth;
    }
    const ownership = await verifyVehicleOwnership(
      auth.data.supabase,
      parsed.data.vehicleId,
      auth.data.userId,
    );
    if (!ownership.success) {
      return ownership;
    }
    const current = await getOwnedPhase(
      auth.data.supabase,
      parsed.data.vehicleId,
      parsed.data.phaseId,
      auth.data.userId,
    );
    if (!current.success) {
      return current;
    }

    const changes: BuildPhaseUpdate = {
      updated_at: new Date().toISOString(),
    };
    if (parsed.data.name !== undefined) {
      changes.name = parsed.data.name;
    }
    if (parsed.data.description !== undefined) {
      changes.description = parsed.data.description;
    }
    if (parsed.data.targetCompletionDate !== undefined) {
      changes.target_completion_date = parsed.data.targetCompletionDate;
    }

    const result = await savePhaseChanges(
      auth.data.supabase,
      parsed.data.vehicleId,
      parsed.data.phaseId,
      auth.data.userId,
      changes,
    );
    if (result.success) {
      revalidatePath(`/garage/${parsed.data.vehicleId}`);
    }
    return result;
  } catch (error) {
    console.error("Build phase update failed.", error);
    return {
      success: false,
      error: "Could not update this build phase. Please try again.",
    };
  }
}

export async function updateBuildPhaseStatus(
  vehicleId: string,
  phaseId: string,
  status: string,
): Promise<BuildPhaseActionResponse> {
  if (!isUuid(vehicleId) || !isUuid(phaseId)) {
    return { success: false, error: "Build phase not found." };
  }
  if (typeof status !== "string" || !isBuildPhaseStatus(status)) {
    return { success: false, error: "Choose a valid phase status." };
  }

  try {
    const auth = await getAuthContext();
    if (!auth.success) {
      return auth;
    }
    const normalizedVehicleId = vehicleId.trim();
    const normalizedPhaseId = phaseId.trim();
    const ownership = await verifyVehicleOwnership(
      auth.data.supabase,
      normalizedVehicleId,
      auth.data.userId,
    );
    if (!ownership.success) {
      return ownership;
    }
    const current = await getOwnedPhase(
      auth.data.supabase,
      normalizedVehicleId,
      normalizedPhaseId,
      auth.data.userId,
    );
    if (!current.success) {
      return current;
    }

    const changes: BuildPhaseUpdate = {
      status,
      updated_at: new Date().toISOString(),
      completed_at:
        status === "completed"
          ? current.data.status === "completed" && current.data.completed_at
            ? current.data.completed_at
            : new Date().toISOString()
          : null,
    };
    const result = await savePhaseChanges(
      auth.data.supabase,
      normalizedVehicleId,
      normalizedPhaseId,
      auth.data.userId,
      changes,
    );
    if (result.success) {
      revalidatePath(`/garage/${normalizedVehicleId}`);
    }
    return result;
  } catch (error) {
    console.error("Build phase status update failed.", error);
    return {
      success: false,
      error: "Could not update this phase status. Please try again.",
    };
  }
}

export async function deleteBuildPhase(
  vehicleId: string,
  phaseId: string,
): Promise<BuildPhaseDeleteActionResponse> {
  if (!isUuid(vehicleId) || !isUuid(phaseId)) {
    return { success: false, error: "Build phase not found." };
  }

  try {
    const auth = await getAuthContext();
    if (!auth.success) {
      return auth;
    }
    const normalizedVehicleId = vehicleId.trim();
    const normalizedPhaseId = phaseId.trim();
    const ownership = await verifyVehicleOwnership(
      auth.data.supabase,
      normalizedVehicleId,
      auth.data.userId,
    );
    if (!ownership.success) {
      return ownership;
    }
    const current = await getOwnedPhase(
      auth.data.supabase,
      normalizedVehicleId,
      normalizedPhaseId,
      auth.data.userId,
    );
    if (!current.success) {
      return current;
    }

    const { data, error } = await auth.data.supabase
      .from("build_phases")
      .delete()
      .eq("id", normalizedPhaseId)
      .eq("vehicle_id", normalizedVehicleId)
      .eq("user_id", auth.data.userId)
      .select("id")
      .maybeSingle();
    if (error) {
      console.error("Could not delete vehicle build phase.", error);
      return {
        success: false,
        error: "Could not delete this build phase. Please try again.",
      };
    }
    if (!data) {
      return { success: false, error: "Build phase not found." };
    }

    revalidatePath(`/garage/${normalizedVehicleId}`);
    return { success: true, data: null };
  } catch (error) {
    console.error("Build phase deletion failed.", error);
    return {
      success: false,
      error: "Could not delete this build phase. Please try again.",
    };
  }
}

export async function assignModificationToPhase(
  vehicleId: string,
  modificationId: string,
  phaseId: string,
): Promise<ActionResult<Mod>> {
  if (!isUuid(vehicleId) || !isUuid(modificationId) || !isUuid(phaseId)) {
    return { success: false, error: "Select a valid modification and phase." };
  }

  try {
    const auth = await getAuthContext();
    if (!auth.success) {
      return auth;
    }
    const normalizedVehicleId = vehicleId.trim();
    const normalizedModificationId = modificationId.trim();
    const normalizedPhaseId = phaseId.trim();
    const ownership = await verifyVehicleOwnership(
      auth.data.supabase,
      normalizedVehicleId,
      auth.data.userId,
    );
    if (!ownership.success) {
      return ownership;
    }
    const phase = await getOwnedPhase(
      auth.data.supabase,
      normalizedVehicleId,
      normalizedPhaseId,
      auth.data.userId,
    );
    if (!phase.success) {
      return phase;
    }

    const { data, error } = await auth.data.supabase
      .from("mods")
      .update({
        phase_id: normalizedPhaseId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", normalizedModificationId)
      .eq("vehicle_id", normalizedVehicleId)
      .eq("user_id", auth.data.userId)
      .is("phase_id", null)
      .select("*")
      .maybeSingle();
    if (error) {
      console.error("Could not assign modification to build phase.", error);
      return {
        success: false,
        error: timelineStorageError(
          error,
          "Could not assign this modification. Please try again.",
        ),
      };
    }
    if (!data) {
      return {
        success: false,
        error: "Modification is already assigned or not found.",
      };
    }

    revalidatePath(`/garage/${normalizedVehicleId}`);
    return { success: true, data };
  } catch (error) {
    console.error("Modification phase assignment failed.", error);
    return {
      success: false,
      error: "Could not assign this modification. Please try again.",
    };
  }
}

export async function unassignModificationFromPhase(
  vehicleId: string,
  modificationId: string,
  phaseId: string,
): Promise<ActionResult<Mod>> {
  if (!isUuid(vehicleId) || !isUuid(modificationId) || !isUuid(phaseId)) {
    return { success: false, error: "Modification or phase not found." };
  }

  try {
    const auth = await getAuthContext();
    if (!auth.success) {
      return auth;
    }
    const normalizedVehicleId = vehicleId.trim();
    const normalizedModificationId = modificationId.trim();
    const normalizedPhaseId = phaseId.trim();
    const ownership = await verifyVehicleOwnership(
      auth.data.supabase,
      normalizedVehicleId,
      auth.data.userId,
    );
    if (!ownership.success) {
      return ownership;
    }
    const phase = await getOwnedPhase(
      auth.data.supabase,
      normalizedVehicleId,
      normalizedPhaseId,
      auth.data.userId,
    );
    if (!phase.success) {
      return phase;
    }

    const { data, error } = await auth.data.supabase
      .from("mods")
      .update({ phase_id: null, updated_at: new Date().toISOString() })
      .eq("id", normalizedModificationId)
      .eq("vehicle_id", normalizedVehicleId)
      .eq("user_id", auth.data.userId)
      .eq("phase_id", normalizedPhaseId)
      .select("*")
      .maybeSingle();
    if (error) {
      console.error("Could not remove modification from build phase.", error);
      return {
        success: false,
        error: timelineStorageError(
          error,
          "Could not remove this modification from its phase. Please try again.",
        ),
      };
    }
    if (!data) {
      return {
        success: false,
        error: "Modification is no longer assigned to this phase.",
      };
    }

    revalidatePath(`/garage/${normalizedVehicleId}`);
    return { success: true, data };
  } catch (error) {
    console.error("Modification phase removal failed.", error);
    return {
      success: false,
      error: "Could not remove this modification from its phase. Please try again.",
    };
  }
}
