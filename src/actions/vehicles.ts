"use server";

import { revalidatePath } from "next/cache";
import { decodeVin } from "@/lib/nhtsa";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/actions";
import type { Vehicle, VehicleInsert } from "@/types/database";
import type { DecodedVehicleInfo } from "@/types/nhtsa";

type VehicleFormState = ActionResult<Vehicle> | undefined;
type DeleteVehicleFormState = ActionResult<null> | undefined;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function lookupVinAction(
  vin: string,
): Promise<ActionResult<DecodedVehicleInfo>> {
  if (typeof vin !== "string") {
    return { success: false, error: "Enter a valid VIN." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Could not verify the current user for VIN lookup.", authError);
      return { success: false, error: "Unable to verify your session. Please try again." };
    }

    if (!user) {
      return { success: false, error: "Sign in to decode a VIN." };
    }

    return await decodeVin(vin);
  } catch (error) {
    console.error("VIN lookup action failed.", error);
    return { success: false, error: "The VIN lookup service is unavailable. Please try again." };
  }
}

function readOptionalText(
  formData: FormData,
  fieldName: string,
  label: string,
  maxLength: number,
): ActionResult<string | null> {
  const value = formData.get(fieldName);

  if (value === null) {
    return { success: true, data: null };
  }

  if (typeof value !== "string") {
    return { success: false, error: `Enter a valid ${label.toLowerCase()}.` };
  }

  const normalizedValue = value.trim();
  if (normalizedValue.length > maxLength) {
    return {
      success: false,
      error: `${label} must be ${maxLength} characters or fewer.`,
    };
  }

  return { success: true, data: normalizedValue || null };
}

export async function createVehicle(
  _previousState: VehicleFormState,
  formData: FormData,
): Promise<ActionResult<Vehicle>> {
  const entryMode = formData.get("entryMode");
  if (entryMode !== "vin" && entryMode !== "manual") {
    return { success: false, error: "Choose how to add this vehicle." };
  }

  const vinValue = formData.get("vin");
  if (vinValue !== null && typeof vinValue !== "string") {
    return { success: false, error: "Enter a valid 17-character VIN." };
  }

  const normalizedVin =
    typeof vinValue === "string" ? vinValue.trim().toUpperCase() : "";
  const hasValidVin = /^[A-HJ-NPR-Z0-9]{17}$/.test(normalizedVin);
  if (
    (entryMode === "vin" && !hasValidVin) ||
    (normalizedVin.length > 0 && !hasValidVin)
  ) {
    return { success: false, error: "Enter a valid 17-character VIN." };
  }
  const vin = normalizedVin || null;

  const yearValue = formData.get("year");
  if (yearValue !== null && typeof yearValue !== "string") {
    return { success: false, error: "Enter a valid model year." };
  }

  const yearText = typeof yearValue === "string" ? yearValue.trim() : "";
  const year = yearText ? Number(yearText) : null;
  if (
    year !== null &&
    (!Number.isInteger(year) || year < 1886 || year > new Date().getFullYear() + 1)
  ) {
    return {
      success: false,
      error: `Enter a model year between 1886 and ${new Date().getFullYear() + 1}.`,
    };
  }

  const make = readOptionalText(formData, "make", "Make", 100);
  const model = readOptionalText(formData, "model", "Model", 100);
  const trim = readOptionalText(formData, "trim", "Trim", 100);
  const nickname = readOptionalText(formData, "nickname", "Nickname", 80);

  if (!make.success) {
    return make;
  }
  if (!model.success) {
    return model;
  }
  if (!trim.success) {
    return trim;
  }
  if (!nickname.success) {
    return nickname;
  }

  const vehicleDetails = {
    vin,
    year,
    make: make.data,
    model: model.data,
    trim: trim.data,
    nickname: nickname.data,
  };

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Could not verify the current user.", authError);
      return { success: false, error: "Unable to verify your session. Please try again." };
    }

    if (!user) {
      return { success: false, error: "Sign in to add a vehicle." };
    }

    const { data, error } = await supabase
      .from("vehicles")
      .insert({ ...vehicleDetails, user_id: user.id } satisfies VehicleInsert)
      .select("*")
      .single();

    if (error) {
      console.error("Could not create vehicle.", { code: error.code });
      if (error.code === "23505") {
        return {
          success: false,
          error: "This vehicle is already in your garage.",
        };
      }
      if (error.code === "23502") {
        return {
          success: false,
          error:
            "Vehicle storage still requires a VIN. Apply the latest Supabase migration to allow VIN-less vehicles.",
        };
      }
      if (error.code === "23514") {
        return {
          success: false,
          error:
            "Vehicle details did not pass storage validation. Check the VIN and model year.",
        };
      }
      if (
        error.code === "PGRST204" ||
        error.code === "PGRST205" ||
        error.code === "42P01" ||
        error.code === "42703"
      ) {
        return {
          success: false,
          error:
            "Vehicle storage is out of date. Apply the latest Supabase migrations and try again.",
        };
      }
      return {
        success: false,
        error: "Could not save this vehicle. Please try again.",
      };
    }

    revalidatePath("/garage");
    return { success: true, data };
  } catch (error) {
    console.error("Vehicle creation failed.", error);
    return { success: false, error: "Could not add this vehicle. Please try again." };
  }
}

export async function getUserVehicles(): Promise<ActionResult<Vehicle[]>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Could not verify the current user.", authError);
      return { success: false, error: "Unable to verify your session. Please try again." };
    }

    if (!user) {
      return { success: false, error: "Sign in to view your garage." };
    }

    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Could not load vehicles.", error);
      if (error.code === "PGRST205" || error.code === "42P01") {
        return {
          success: false,
          error: "Vehicle storage is not set up yet. Apply the vehicles SQL migration.",
        };
      }
      return { success: false, error: "Could not load your vehicles. Please try again." };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Vehicle lookup failed.", error);
    return { success: false, error: "Could not load your vehicles. Please try again." };
  }
}

export async function getUserVehicle(
  vehicleId: string,
): Promise<ActionResult<Vehicle>> {
  if (typeof vehicleId !== "string" || !UUID_PATTERN.test(vehicleId.trim())) {
    return { success: false, error: "Vehicle not found in your garage." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Could not verify the current user.", authError);
      return { success: false, error: "Unable to verify your session. Please try again." };
    }

    if (!user) {
      return { success: false, error: "Sign in to view this vehicle." };
    }

    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", vehicleId.trim())
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Could not load vehicle details.", error);
      return { success: false, error: "Could not load this vehicle. Please try again." };
    }

    if (!data) {
      return { success: false, error: "Vehicle not found in your garage." };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Vehicle detail lookup failed.", error);
    return { success: false, error: "Could not load this vehicle. Please try again." };
  }
}

export async function deleteVehicle(
  _previousState: DeleteVehicleFormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  const vehicleId = formData.get("vehicleId");
  if (typeof vehicleId !== "string" || vehicleId.trim().length === 0) {
    return { success: false, error: "Select a valid vehicle to delete." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Could not verify the current user.", authError);
      return { success: false, error: "Unable to verify your session. Please try again." };
    }

    if (!user) {
      return { success: false, error: "Sign in to delete a vehicle." };
    }

    const { data, error } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", vehicleId.trim())
      .eq("user_id", user.id)
      .select("id");

    if (error) {
      console.error("Could not delete vehicle.", error);
      return { success: false, error: "Could not delete this vehicle. Please try again." };
    }

    if (data.length === 0) {
      return { success: false, error: "Vehicle not found or already deleted." };
    }

    revalidatePath("/garage");
    return { success: true, data: null };
  } catch (error) {
    console.error("Vehicle deletion failed.", error);
    return { success: false, error: "Could not delete this vehicle. Please try again." };
  }
}
