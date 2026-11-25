"use server";

import { revalidatePath } from "next/cache";
import { decodeVin } from "@/lib/nhtsa";
import {
  removeVehiclePhotoObject,
  withVehiclePhotoUrl,
} from "@/lib/vehicle-media";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/actions";
import type { Vehicle, VehicleInsert, VehicleUpdate } from "@/types/database";
import type { DecodedVehicleInfo } from "@/types/nhtsa";
import type { VehicleWithMedia } from "@/types/vehicle-media";

type VehicleFormState = ActionResult<Vehicle> | undefined;
type DeleteVehicleFormState = ActionResult<null> | undefined;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface VehicleDetails {
  vin: string | null;
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  nickname: string | null;
}

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

function readVehicleDetails(
  formData: FormData,
  vinRequired: boolean,
): ActionResult<VehicleDetails> {
  const vinValue = formData.get("vin");
  if (vinValue !== null && typeof vinValue !== "string") {
    return { success: false, error: "Enter a valid 17-character VIN." };
  }

  const normalizedVin =
    typeof vinValue === "string" ? vinValue.trim().toUpperCase() : "";
  const hasValidVin = /^[A-HJ-NPR-Z0-9]{17}$/.test(normalizedVin);
  if (
    (vinRequired && !hasValidVin) ||
    (normalizedVin.length > 0 && !hasValidVin)
  ) {
    return { success: false, error: "Enter a valid 17-character VIN." };
  }

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

  return {
    success: true,
    data: {
      vin: normalizedVin || null,
      year,
      make: make.data,
      model: model.data,
      trim: trim.data,
      nickname: nickname.data,
    },
  };
}

export async function createVehicle(
  _previousState: VehicleFormState,
  formData: FormData,
): Promise<ActionResult<Vehicle>> {
  const entryMode = formData.get("entryMode");
  if (entryMode !== "vin" && entryMode !== "manual") {
    return { success: false, error: "Choose how to add this vehicle." };
  }

  const vehicleDetails = readVehicleDetails(formData, entryMode === "vin");
  if (!vehicleDetails.success) {
    return vehicleDetails;
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
      return { success: false, error: "Sign in to add a vehicle." };
    }

    const { data, error } = await supabase
      .from("vehicles")
      .insert({ ...vehicleDetails.data, user_id: user.id } satisfies VehicleInsert)
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

export async function updateVehicle(
  _previousState: VehicleFormState,
  formData: FormData,
): Promise<ActionResult<Vehicle>> {
  const vehicleId = formData.get("vehicleId");
  if (typeof vehicleId !== "string" || !UUID_PATTERN.test(vehicleId.trim())) {
    return { success: false, error: "Select a valid vehicle to update." };
  }

  const vehicleDetails = readVehicleDetails(formData, false);
  if (!vehicleDetails.success) {
    return vehicleDetails;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Could not verify the current user for vehicle update.", {
        code: authError.code,
      });
      return {
        success: false,
        error: "Unable to verify your session. Please try again.",
      };
    }

    if (!user) {
      return { success: false, error: "Sign in to update a vehicle." };
    }

    const updateData = {
      ...vehicleDetails.data,
      updated_at: new Date().toISOString(),
    } satisfies VehicleUpdate;
    const { data, error } = await supabase
      .from("vehicles")
      .update(updateData)
      .eq("id", vehicleId.trim())
      .eq("user_id", user.id)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("Could not update vehicle.", { code: error.code });
      if (error.code === "23505") {
        return {
          success: false,
          error: "This vehicle is already in your garage.",
        };
      }
      if (error.code === "23514") {
        return {
          success: false,
          error:
            "Vehicle details did not pass storage validation. Check the VIN and model year.",
        };
      }
      return {
        success: false,
        error: "Could not update this vehicle. Please try again.",
      };
    }

    if (!data) {
      return {
        success: false,
        error: "Vehicle not found in your garage.",
      };
    }

    revalidatePath("/garage");
    revalidatePath(`/garage/${vehicleId.trim()}`);
    return { success: true, data };
  } catch (error) {
    console.error("Vehicle update failed.", error);
    return {
      success: false,
      error: "Could not update this vehicle. Please try again.",
    };
  }
}

export async function getUserVehicles(): Promise<ActionResult<VehicleWithMedia[]>> {
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

    const vehiclesWithMedia = await Promise.all(
      data.map((vehicle) => withVehiclePhotoUrl(supabase, vehicle)),
    );
    return { success: true, data: vehiclesWithMedia };
  } catch (error) {
    console.error("Vehicle lookup failed.", error);
    return { success: false, error: "Could not load your vehicles. Please try again." };
  }
}

export async function getUserVehicle(
  vehicleId: string,
): Promise<ActionResult<VehicleWithMedia>> {
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

    return {
      success: true,
      data: await withVehiclePhotoUrl(supabase, data),
    };
  } catch (error) {
    console.error("Vehicle detail lookup failed.", error);
    return { success: false, error: "Could not load this vehicle. Please try again." };
  }
}

export async function deleteVehicle(
  _previousState: DeleteVehicleFormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  const vehicleIdValue = formData.get("vehicleId");
  if (
    typeof vehicleIdValue !== "string" ||
    !UUID_PATTERN.test(vehicleIdValue.trim())
  ) {
    return { success: false, error: "Select a valid vehicle to delete." };
  }
  const vehicleId = vehicleIdValue.trim();

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

    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicles")
      .select("id, photo_path")
      .eq("id", vehicleId)
      .eq("user_id", user.id)
      .maybeSingle();

    let photoPath: string | null = null;
    let photoColumnAvailable = true;
    if (vehicleError) {
      console.error("Could not load vehicle media before deletion.", {
        code: vehicleError.code,
      });
      if (vehicleError.code === "PGRST204" || vehicleError.code === "42703") {
        photoColumnAvailable = false;
      } else {
        return {
          success: false,
          error: "Could not verify this vehicle. Please try again.",
        };
      }
    } else if (!vehicle) {
      return { success: false, error: "Vehicle not found or already deleted." };
    } else {
      photoPath = vehicle.photo_path;
    }

    if (photoPath) {
      const photoRemoval = await removeVehiclePhotoObject(supabase, photoPath);
      if (!photoRemoval.success) {
        return {
          success: false,
          error:
            "Could not remove this vehicle's photo, so the vehicle was not deleted. Please try again.",
        };
      }
    }

    const deleteResult = photoColumnAvailable
      ? photoPath
        ? await supabase
            .from("vehicles")
            .delete()
            .eq("id", vehicleId)
            .eq("user_id", user.id)
            .eq("photo_path", photoPath)
            .select("id")
        : await supabase
            .from("vehicles")
            .delete()
            .eq("id", vehicleId)
            .eq("user_id", user.id)
            .is("photo_path", null)
            .select("id")
      : await supabase
          .from("vehicles")
          .delete()
          .eq("id", vehicleId)
          .eq("user_id", user.id)
          .select("id");

    if (deleteResult.error) {
      console.error("Could not delete vehicle.", deleteResult.error);
      if (photoPath) {
        const { error: clearPhotoError } = await supabase
          .from("vehicles")
          .update({
            photo_path: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", vehicleId)
          .eq("user_id", user.id)
          .eq("photo_path", photoPath);
        if (clearPhotoError) {
          console.error("Could not clear the deleted vehicle photo reference.", {
            code: clearPhotoError.code,
          });
        }
        revalidatePath("/garage");
        revalidatePath(`/garage/${vehicleId}`);
        return {
          success: false,
          error:
            "The photo was removed, but the vehicle could not be deleted. Please try again.",
        };
      }
      return { success: false, error: "Could not delete this vehicle. Please try again." };
    }

    if (deleteResult.data.length === 0) {
      if (photoPath) {
        const { error: clearPhotoError } = await supabase
          .from("vehicles")
          .update({
            photo_path: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", vehicleId)
          .eq("user_id", user.id)
          .eq("photo_path", photoPath);
        if (clearPhotoError) {
          console.error("Could not clear the deleted vehicle photo reference.", {
            code: clearPhotoError.code,
          });
        }
        revalidatePath("/garage");
        revalidatePath(`/garage/${vehicleId}`);
      }
      return {
        success: false,
        error:
          "Vehicle not found or its photo changed. Refresh your garage and try again.",
      };
    }

    revalidatePath("/garage");
    revalidatePath(`/garage/${vehicleId}`);
    return { success: true, data: null };
  } catch (error) {
    console.error("Vehicle deletion failed.", error);
    return { success: false, error: "Could not delete this vehicle. Please try again." };
  }
}
