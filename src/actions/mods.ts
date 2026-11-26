"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/actions";
import {
  SELECTABLE_MOD_CATEGORIES,
  MOD_STATUSES,
  type Mod,
  type ModInsert,
  type ModStatus,
} from "@/types/database";
import type { GarageModSummary } from "@/types/garage";
import { normalizePurchaseUrl } from "@/lib/purchase-url";

type ModFormState = ActionResult<Mod> | undefined;
type SupabaseClient = Awaited<ReturnType<typeof createClient>>;
type AuthContext = { supabase: SupabaseClient; userId: string };
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getAuthContext(): Promise<ActionResult<AuthContext>> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Could not verify the current user for a mod action.", error);
    return { success: false, error: "Unable to verify your session. Please try again." };
  }

  if (!user) {
    return { success: false, error: "Sign in to manage vehicle modifications." };
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
    console.error("Could not verify vehicle ownership for a mod action.", error);
    return { success: false, error: "Could not verify this vehicle. Please try again." };
  }

  if (!data) {
    return { success: false, error: "Vehicle not found in your garage." };
  }

  return { success: true, data: null };
}

async function getOwnedModVehicleId(
  supabase: SupabaseClient,
  modId: string,
  userId: string,
): Promise<ActionResult<string>> {
  const { data: mod, error } = await supabase
    .from("mods")
    .select("vehicle_id")
    .eq("id", modId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Could not load modification ownership.", error);
    return { success: false, error: "Could not verify this modification. Please try again." };
  }

  if (!mod) {
    return { success: false, error: "Modification not found." };
  }

  const ownership = await verifyVehicleOwnership(supabase, mod.vehicle_id, userId);
  if (!ownership.success) {
    return ownership;
  }

  return { success: true, data: mod.vehicle_id };
}

function readText(
  formData: FormData,
  fieldName: string,
  label: string,
  maxLength: number,
  required: true,
): ActionResult<string>;
function readText(
  formData: FormData,
  fieldName: string,
  label: string,
  maxLength: number,
  required: false,
): ActionResult<string | null>;
function readText(
  formData: FormData,
  fieldName: string,
  label: string,
  maxLength: number,
  required: boolean,
): ActionResult<string | null> {
  const value = formData.get(fieldName);
  if (value === null && !required) {
    return { success: true, data: null };
  }

  if (typeof value !== "string") {
    return { success: false, error: `Enter a valid ${label.toLowerCase()}.` };
  }

  const normalized = value.trim();
  if (required && normalized.length === 0) {
    return { success: false, error: `${label} is required.` };
  }
  if (normalized.length > maxLength) {
    return { success: false, error: `${label} must be ${maxLength} characters or fewer.` };
  }

  return { success: true, data: normalized || null };
}

function readEnum<T extends string>(
  formData: FormData,
  fieldName: string,
  label: string,
  values: readonly T[],
): ActionResult<T> {
  const value = formData.get(fieldName);
  if (typeof value !== "string" || !values.some((candidate) => candidate === value)) {
    return { success: false, error: `Choose a valid ${label.toLowerCase()}.` };
  }

  return { success: true, data: value as T };
}

function readCost(formData: FormData): ActionResult<number> {
  const value = formData.get("cost");
  if (typeof value !== "string" || !/^\d{1,10}(?:\.\d{1,2})?$/.test(value.trim())) {
    return { success: false, error: "Enter a non-negative cost with up to two decimal places." };
  }

  const cost = Number(value);
  if (!Number.isFinite(cost)) {
    return { success: false, error: "Enter a valid cost." };
  }

  return { success: true, data: cost };
}

function readInstallDate(formData: FormData): ActionResult<string | null> {
  const value = formData.get("install_date");
  if (value === null || value === "") {
    return { success: true, data: null };
  }
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { success: false, error: "Enter a valid install date." };
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return { success: false, error: "Enter a valid install date." };
  }

  return { success: true, data: value };
}

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function isModStatus(value: string): value is ModStatus {
  return MOD_STATUSES.some((status) => status === value);
}

export async function getVehicleMods(
  vehicleId: string,
): Promise<ActionResult<Mod[]>> {
  if (typeof vehicleId !== "string" || !isUuid(vehicleId.trim())) {
    return { success: false, error: "Vehicle not found in your garage." };
  }

  try {
    const auth = await getAuthContext();
    if (!auth.success) {
      return auth;
    }

    const ownership = await verifyVehicleOwnership(
      auth.data.supabase,
      vehicleId.trim(),
      auth.data.userId,
    );
    if (!ownership.success) {
      return ownership;
    }

    const { data, error } = await auth.data.supabase
      .from("mods")
      .select("*")
      .eq("vehicle_id", vehicleId.trim())
      .eq("user_id", auth.data.userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Could not load vehicle modifications.", error);
      if (error.code === "PGRST205" || error.code === "42P01") {
        return {
          success: false,
          error: "Modification storage is unavailable. Check the mods database migration.",
        };
      }
      return { success: false, error: "Could not load modifications. Please try again." };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Modification lookup failed.", error);
    return { success: false, error: "Could not load modifications. Please try again." };
  }
}

export async function getGarageModSummaries(): Promise<
  ActionResult<GarageModSummary[]>
> {
  try {
    const auth = await getAuthContext();
    if (!auth.success) {
      return { success: false, error: auth.error };
    }

    const { data, error } = await auth.data.supabase
      .from("mods")
      .select("vehicle_id,status,cost")
      .eq("user_id", auth.data.userId);

    if (error) {
      console.error("Could not load garage modification summaries.", error);
      return {
        success: false,
        error: "Modification summaries are unavailable. Please try again.",
      };
    }

    const summaries = new Map<string, GarageModSummary>();

    for (const mod of data) {
      let summary = summaries.get(mod.vehicle_id);
      if (!summary) {
        summary = {
          vehicleId: mod.vehicle_id,
          totalModCount: 0,
          installedCount: 0,
          orderedCount: 0,
          wishlistCount: 0,
          installedCost: 0,
          orderedCost: 0,
          wishlistCost: 0,
          plannedCost: 0,
        };
        summaries.set(mod.vehicle_id, summary);
      }

      summary.totalModCount += 1;
      if (mod.status === "Installed") {
        summary.installedCount += 1;
        summary.installedCost += mod.cost;
      } else if (mod.status === "Ordered") {
        summary.orderedCount += 1;
        summary.orderedCost += mod.cost;
      } else {
        summary.wishlistCount += 1;
        summary.wishlistCost += mod.cost;
      }
      summary.plannedCost = summary.orderedCost + summary.wishlistCost;
    }

    return { success: true, data: Array.from(summaries.values()) };
  } catch (error) {
    console.error("Garage modification summary lookup failed.", error);
    return {
      success: false,
      error: "Modification summaries are unavailable. Please try again.",
    };
  }
}

export async function createMod(
  _previousState: ModFormState,
  formData: FormData,
): Promise<ActionResult<Mod>> {
  const vehicleIdValue = formData.get("vehicleId");
  if (typeof vehicleIdValue !== "string" || !isUuid(vehicleIdValue.trim())) {
    return { success: false, error: "Select a valid vehicle." };
  }

  const partName = readText(formData, "part_name", "Part name", 150, true);
  const brand = readText(formData, "brand", "Brand", 100, false);
  const category = readEnum(formData, "category", "Category", SELECTABLE_MOD_CATEGORIES);
  const status = readEnum(formData, "status", "Status", MOD_STATUSES);
  const cost = readCost(formData);
  const installDate = readInstallDate(formData);
  const notes = readText(formData, "notes", "Notes", 2000, false);
  const rawPurchaseUrl = formData.get("purchase_url");
  const purchaseUrl = normalizePurchaseUrl(rawPurchaseUrl);

  if (!partName.success) return partName;
  if (!brand.success) return brand;
  if (!category.success) return category;
  if (!status.success) return status;
  if (!cost.success) return cost;
  if (!installDate.success) return installDate;
  if (!notes.success) return notes;
  if (!purchaseUrl.success) return purchaseUrl;

  try {
    const auth = await getAuthContext();
    if (!auth.success) {
      return auth;
    }

    const vehicleId = vehicleIdValue.trim();
    const ownership = await verifyVehicleOwnership(
      auth.data.supabase,
      vehicleId,
      auth.data.userId,
    );
    if (!ownership.success) {
      return ownership;
    }

    const { data, error } = await auth.data.supabase
      .from("mods")
      .insert({
        vehicle_id: vehicleId,
        user_id: auth.data.userId,
        part_name: partName.data,
        brand: brand.data,
        category: category.data,
        status: status.data,
        cost: cost.data,
        install_date: installDate.data,
        notes: notes.data,
        purchase_url: purchaseUrl.data,
      } satisfies ModInsert)
      .select("*")
      .single();

    if (error) {
      console.error("Could not create vehicle modification.", error);
      return { success: false, error: "Could not save this modification. Please try again." };
    }

    revalidatePath("/garage");
    revalidatePath(`/garage/${vehicleId}`);
    return { success: true, data };
  } catch (error) {
    console.error("Modification creation failed.", error);
    return { success: false, error: "Could not save this modification. Please try again." };
  }
}

export async function updateModStatus(
  modId: string,
  status: string,
): Promise<ActionResult<Mod>> {
  if (typeof modId !== "string" || !isUuid(modId.trim())) {
    return { success: false, error: "Modification not found." };
  }
  if (typeof status !== "string" || !isModStatus(status)) {
    return { success: false, error: "Choose a valid modification status." };
  }

  try {
    const auth = await getAuthContext();
    if (!auth.success) {
      return auth;
    }

    const id = modId.trim();
    const ownership = await getOwnedModVehicleId(
      auth.data.supabase,
      id,
      auth.data.userId,
    );
    if (!ownership.success) {
      return ownership;
    }

    const { data, error } = await auth.data.supabase
      .from("mods")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("vehicle_id", ownership.data)
      .eq("user_id", auth.data.userId)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("Could not update modification status.", error);
      return { success: false, error: "Could not update this status. Please try again." };
    }
    if (!data) {
      return { success: false, error: "Modification not found." };
    }

    revalidatePath(`/garage/${ownership.data}`);
    return { success: true, data };
  } catch (error) {
    console.error("Modification status update failed.", error);
    return { success: false, error: "Could not update this status. Please try again." };
  }
}

export async function updateModPurchaseUrl(
  modId: string,
  purchaseUrl: string,
): Promise<ActionResult<Mod>> {
  if (typeof modId !== "string" || !isUuid(modId.trim())) {
    return { success: false, error: "Modification not found." };
  }
  const normalized = normalizePurchaseUrl(purchaseUrl);
  if (!normalized.success) {
    return normalized;
  }

  try {
    const auth = await getAuthContext();
    if (!auth.success) {
      return auth;
    }

    const id = modId.trim();
    const ownership = await getOwnedModVehicleId(
      auth.data.supabase,
      id,
      auth.data.userId,
    );
    if (!ownership.success) {
      return ownership;
    }

    const { data, error } = await auth.data.supabase
      .from("mods")
      .update({
        purchase_url: normalized.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("vehicle_id", ownership.data)
      .eq("user_id", auth.data.userId)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("Could not update modification purchase link.", error);
      return { success: false, error: "Could not save this link. Please try again." };
    }
    if (!data) {
      return { success: false, error: "Modification not found." };
    }

    revalidatePath(`/garage/${ownership.data}`);
    return { success: true, data };
  } catch (error) {
    console.error("Modification purchase link update failed.", error);
    return { success: false, error: "Could not save this link. Please try again." };
  }
}

export async function deleteMod(modId: string): Promise<ActionResult<null>> {
  if (typeof modId !== "string" || !isUuid(modId.trim())) {
    return { success: false, error: "Modification not found." };
  }

  try {
    const auth = await getAuthContext();
    if (!auth.success) {
      return auth;
    }

    const id = modId.trim();
    const ownership = await getOwnedModVehicleId(
      auth.data.supabase,
      id,
      auth.data.userId,
    );
    if (!ownership.success) {
      return ownership;
    }

    const { data, error } = await auth.data.supabase
      .from("mods")
      .delete()
      .eq("id", id)
      .eq("vehicle_id", ownership.data)
      .eq("user_id", auth.data.userId)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Could not delete vehicle modification.", error);
      return { success: false, error: "Could not delete this modification. Please try again." };
    }
    if (!data) {
      return { success: false, error: "Modification not found." };
    }

    revalidatePath(`/garage/${ownership.data}`);
    return { success: true, data: null };
  } catch (error) {
    console.error("Modification deletion failed.", error);
    return { success: false, error: "Could not delete this modification. Please try again." };
  }
}
