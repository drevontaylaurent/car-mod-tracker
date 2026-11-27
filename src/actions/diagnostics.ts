"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { buildDiagnosticInsert } from "@/lib/diagnostics/diagnostic-insert";
import { validateDiagnosticCode } from "@/lib/diagnostics/normalize-diagnostic-code";
import type { ActionResult } from "@/types/actions";
import type {
  CreateDiagnosticInput,
  DiagnosticActionResponse,
  DiagnosticDeleteActionResponse,
  DiagnosticListActionResponse,
  DiagnosticSeverity,
  DiagnosticStatus,
  UpdateDiagnosticInput,
  VehicleDiagnostic,
  VehicleDiagnosticInsert,
  VehicleDiagnosticUpdate,
} from "@/types/diagnostics";
import {
  DIAGNOSTIC_SEVERITIES,
  DIAGNOSTIC_STATUSES,
} from "@/types/diagnostics";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;
type AuthContext = { supabase: SupabaseClient; userId: string };
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value.trim());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDiagnosticStatus(value: string): value is DiagnosticStatus {
  return DIAGNOSTIC_STATUSES.some((status) => status === value);
}

function isDiagnosticSeverity(value: string): value is DiagnosticSeverity {
  return DIAGNOSTIC_SEVERITIES.some((severity) => severity === value);
}

function diagnosticStorageError(
  error: { code?: string },
  fallback: string,
): string {
  if (error.code === "PGRST205" || error.code === "42P01") {
    return "Diagnostic storage is unavailable. Apply the vehicle diagnostics migration to enable the tracker.";
  }
  return fallback;
}

function parseRecordedDate(value: unknown): ActionResult<string | null> {
  if (value === null || value === undefined || value === "") {
    return { success: true, data: null };
  }
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    value.startsWith("0000-")
  ) {
    return { success: false, error: "Enter a valid recorded date." };
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return { success: false, error: "Enter a valid recorded date." };
  }

  return { success: true, data: value };
}

function logDiagnosticInsertFailure(
  error: {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
  },
  insert: VehicleDiagnosticInsert,
  authenticatedUserExists: boolean,
) {
  if (process.env.NODE_ENV === "development") {
    console.error("Vehicle diagnostic insert rejected by Supabase/PostgreSQL.", {
      databaseError: {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      },
      insert: {
        vehicleId: insert.vehicle_id,
        authenticatedUserExists,
        normalizedCode: insert.code,
        severity: insert.severity,
        status: insert.status ?? "active",
        description: insert.description ?? null,
        notes: insert.notes ?? null,
      },
    });
    return;
  }

  console.error("Could not create vehicle diagnostic.", {
    code: error.code,
  });
}

async function getAuthContext(): Promise<ActionResult<AuthContext>> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Could not verify the current user for a diagnostic action.", error);
    return {
      success: false,
      error: "Unable to verify your session. Please try again.",
    };
  }

  if (!user) {
    return {
      success: false,
      error: "Sign in to manage vehicle diagnostics.",
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
    console.error("Could not verify vehicle ownership for a diagnostic action.", error);
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

function parseCreateInput(formData: FormData): ActionResult<CreateDiagnosticInput> {
  const vehicleId = formData.get("vehicleId");
  if (!isUuid(vehicleId)) {
    return { success: false, error: "Vehicle not found in your garage." };
  }

  const rawCode = formData.get("code");
  if (typeof rawCode !== "string") {
    return { success: false, error: "Enter a valid diagnostic code." };
  }
  const code = validateDiagnosticCode(rawCode);
  if (!code) {
    return {
      success: false,
      error: "Enter a diagnostic code between 1 and 32 characters.",
    };
  }

  const rawSeverity = formData.get("severity");
  if (
    typeof rawSeverity !== "string" ||
    !isDiagnosticSeverity(rawSeverity)
  ) {
    return { success: false, error: "Choose a valid severity." };
  }

  const recordedDate = parseRecordedDate(formData.get("recorded_date"));
  if (!recordedDate.success) {
    return recordedDate;
  }

  return {
    success: true,
    data: {
      vehicleId: vehicleId.trim(),
      code,
      severity: rawSeverity,
      recordedDate: recordedDate.data,
    },
  };
}

function parseUpdateInput(value: unknown): ActionResult<UpdateDiagnosticInput> {
  if (!isRecord(value) || !isUuid(value.vehicleId) || !isUuid(value.diagnosticId)) {
    return { success: false, error: "Diagnostic record not found." };
  }

  const input: UpdateDiagnosticInput = {
    vehicleId: value.vehicleId.trim(),
    diagnosticId: value.diagnosticId.trim(),
  };
  let hasUpdate = false;

  if (value.code !== undefined) {
    if (typeof value.code !== "string") {
      return { success: false, error: "Enter a valid diagnostic code." };
    }
    const code = validateDiagnosticCode(value.code);
    if (!code) {
      return {
        success: false,
        error: "Enter a diagnostic code between 1 and 32 characters.",
      };
    }
    input.code = code;
    hasUpdate = true;
  }

  if (value.status !== undefined) {
    if (typeof value.status !== "string" || !isDiagnosticStatus(value.status)) {
      return { success: false, error: "Choose a valid diagnostic status." };
    }
    input.status = value.status;
    hasUpdate = true;
  }

  if (value.severity !== undefined) {
    if (typeof value.severity !== "string" || !isDiagnosticSeverity(value.severity)) {
      return { success: false, error: "Choose a valid severity." };
    }
    input.severity = value.severity;
    hasUpdate = true;
  }

  if (value.notes !== undefined) {
    if (value.notes !== null && typeof value.notes !== "string") {
      return { success: false, error: "Enter valid notes." };
    }
    const notes = typeof value.notes === "string" ? value.notes.trim() : null;
    if (notes !== null && notes.length > 2000) {
      return {
        success: false,
        error: "Notes must be 2000 characters or fewer.",
      };
    }
    input.notes = notes || null;
    hasUpdate = true;
  }

  if (value.recordedDate !== undefined) {
    const recordedDate = parseRecordedDate(value.recordedDate);
    if (!recordedDate.success) {
      return recordedDate;
    }
    input.recordedDate = recordedDate.data;
    hasUpdate = true;
  }

  if (!hasUpdate) {
    return { success: false, error: "Change at least one diagnostic field." };
  }

  return { success: true, data: input };
}

async function getOwnedDiagnostic(
  supabase: SupabaseClient,
  vehicleId: string,
  diagnosticId: string,
  userId: string,
): Promise<ActionResult<VehicleDiagnostic>> {
  const { data, error } = await supabase
    .from("vehicle_diagnostics")
    .select("*")
    .eq("id", diagnosticId)
    .eq("vehicle_id", vehicleId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Could not load the owned diagnostic record.", error);
    return {
      success: false,
      error: diagnosticStorageError(
        error,
        "Could not verify this diagnostic record. Please try again.",
      ),
    };
  }

  if (!data) {
    return { success: false, error: "Diagnostic record not found." };
  }

  return { success: true, data };
}

export async function getVehicleDiagnostics(
  vehicleId: string,
): Promise<DiagnosticListActionResponse> {
  if (!isUuid(vehicleId)) {
    return { success: false, error: "Vehicle not found in your garage." };
  }

  try {
    const auth = await getAuthContext();
    if (!auth.success) {
      return { success: false, error: auth.error };
    }

    const normalizedVehicleId = vehicleId.trim();
    const ownership = await verifyVehicleOwnership(
      auth.data.supabase,
      normalizedVehicleId,
      auth.data.userId,
    );
    if (!ownership.success) {
      return { success: false, error: ownership.error };
    }

    const { data, error } = await auth.data.supabase
      .from("vehicle_diagnostics")
      .select("*")
      .eq("vehicle_id", normalizedVehicleId)
      .eq("user_id", auth.data.userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Could not load vehicle diagnostic records.", error);
      return {
        success: false,
        error: diagnosticStorageError(
          error,
          "Could not load diagnostic records. Please try again.",
        ),
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Vehicle diagnostic lookup failed.", error);
    return {
      success: false,
      error: "Could not load diagnostic records. Please try again.",
    };
  }
}

export async function createVehicleDiagnostic(
  _previousState: DiagnosticActionResponse | undefined,
  formData: FormData,
): Promise<DiagnosticActionResponse> {
  const parsed = parseCreateInput(formData);
  if (!parsed.success) {
    return parsed;
  }

  try {
    const auth = await getAuthContext();
    if (!auth.success) {
      return { success: false, error: auth.error };
    }

    const ownership = await verifyVehicleOwnership(
      auth.data.supabase,
      parsed.data.vehicleId,
      auth.data.userId,
    );
    if (!ownership.success) {
      return { success: false, error: ownership.error };
    }

    const insert: VehicleDiagnosticInsert & Record<string, unknown> = {
      ...buildDiagnosticInsert({
        vehicleId: parsed.data.vehicleId,
        userId: auth.data.userId,
        code: parsed.data.code,
        severity: parsed.data.severity,
      }),
      recorded_date: parsed.data.recordedDate,
    };
    if (process.env.NODE_ENV === "development") {
      console.info("Vehicle diagnostic insert payload.", {
        vehicleId: insert.vehicle_id,
        authenticatedUserExists: Boolean(auth.data.userId),
        normalizedCode: insert.code,
        severity: insert.severity,
        status: insert.status ?? "active",
        description: insert.description ?? null,
        notes: insert.notes ?? null,
      });
    }
    const { data, error } = await auth.data.supabase
      .from("vehicle_diagnostics")
      .insert(insert)
      .select("*")
      .single();

    if (error) {
      logDiagnosticInsertFailure(error, insert, Boolean(auth.data.userId));
      return {
        success: false,
        error: diagnosticStorageError(
          error,
          "Could not add this diagnostic. Please try again.",
        ),
      };
    }

    revalidatePath(`/garage/${parsed.data.vehicleId}`);
    return { success: true, data };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Vehicle diagnostic creation failed before returning.", error);
    } else {
      console.error("Vehicle diagnostic creation failed.");
    }
    return {
      success: false,
      error: "Could not add this diagnostic. Please try again.",
    };
  }
}

async function updateDiagnostic(
  value: unknown,
): Promise<DiagnosticActionResponse> {
  const parsed = parseUpdateInput(value);
  if (!parsed.success) {
    return parsed;
  }

  try {
    const auth = await getAuthContext();
    if (!auth.success) {
      return { success: false, error: auth.error };
    }

    const ownership = await verifyVehicleOwnership(
      auth.data.supabase,
      parsed.data.vehicleId,
      auth.data.userId,
    );
    if (!ownership.success) {
      return { success: false, error: ownership.error };
    }

    const current = await getOwnedDiagnostic(
      auth.data.supabase,
      parsed.data.vehicleId,
      parsed.data.diagnosticId,
      auth.data.userId,
    );
    if (!current.success) {
      return { success: false, error: current.error };
    }

    const changes: VehicleDiagnosticUpdate = {
      updated_at: new Date().toISOString(),
    };
    if (parsed.data.code !== undefined && parsed.data.code !== current.data.code) {
      changes.code = parsed.data.code;
    }
    if (parsed.data.severity !== undefined) {
      changes.severity = parsed.data.severity;
    }
    if (parsed.data.notes !== undefined) {
      changes.notes = parsed.data.notes;
    }
    if (parsed.data.recordedDate !== undefined) {
      changes.recorded_date = parsed.data.recordedDate;
    }
    if (parsed.data.status !== undefined) {
      changes.status = parsed.data.status;
      changes.resolved_at =
        parsed.data.status === "resolved"
          ? current.data.status === "resolved"
            ? current.data.resolved_at
            : new Date().toISOString()
          : null;
    }

    const { data, error } = await auth.data.supabase
      .from("vehicle_diagnostics")
      .update(changes)
      .eq("id", parsed.data.diagnosticId)
      .eq("vehicle_id", parsed.data.vehicleId)
      .eq("user_id", auth.data.userId)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("Could not update vehicle diagnostic.", error);
      return {
        success: false,
        error: diagnosticStorageError(
          error,
          "Could not update this diagnostic. Please try again.",
        ),
      };
    }
    if (!data) {
      return { success: false, error: "Diagnostic record not found." };
    }

    revalidatePath(`/garage/${parsed.data.vehicleId}`);
    return { success: true, data };
  } catch (error) {
    console.error("Vehicle diagnostic update failed.", error);
    return {
      success: false,
      error: "Could not update this diagnostic. Please try again.",
    };
  }
}

export async function updateVehicleDiagnostic(
  input: UpdateDiagnosticInput,
): Promise<DiagnosticActionResponse> {
  return updateDiagnostic(input);
}

export async function resolveVehicleDiagnostic(
  vehicleId: string,
  diagnosticId: string,
): Promise<DiagnosticActionResponse> {
  return updateDiagnostic({ vehicleId, diagnosticId, status: "resolved" });
}

export async function deleteVehicleDiagnostic(
  vehicleId: string,
  diagnosticId: string,
): Promise<DiagnosticDeleteActionResponse> {
  if (!isUuid(vehicleId) || !isUuid(diagnosticId)) {
    return { success: false, error: "Diagnostic record not found." };
  }

  try {
    const auth = await getAuthContext();
    if (!auth.success) {
      return { success: false, error: auth.error };
    }

    const normalizedVehicleId = vehicleId.trim();
    const normalizedDiagnosticId = diagnosticId.trim();
    const ownership = await verifyVehicleOwnership(
      auth.data.supabase,
      normalizedVehicleId,
      auth.data.userId,
    );
    if (!ownership.success) {
      return { success: false, error: ownership.error };
    }

    const { data, error } = await auth.data.supabase
      .from("vehicle_diagnostics")
      .delete()
      .eq("id", normalizedDiagnosticId)
      .eq("vehicle_id", normalizedVehicleId)
      .eq("user_id", auth.data.userId)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Could not delete vehicle diagnostic.", error);
      return {
        success: false,
        error: diagnosticStorageError(
          error,
          "Could not delete this diagnostic. Please try again.",
        ),
      };
    }
    if (!data) {
      return { success: false, error: "Diagnostic record not found." };
    }

    revalidatePath(`/garage/${normalizedVehicleId}`);
    return { success: true, data: null };
  } catch (error) {
    console.error("Vehicle diagnostic deletion failed.", error);
    return {
      success: false,
      error: "Could not delete this diagnostic. Please try again.",
    };
  }
}
