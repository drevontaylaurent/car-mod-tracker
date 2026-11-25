"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  getVehiclePhotoUrl,
  removeVehiclePhotoObject,
  uploadVehiclePhotoObject,
  validateVehiclePhoto,
} from "@/lib/vehicle-media";
import { MAX_VEHICLE_PHOTO_BYTES } from "@/lib/vehicle-media-constants";
import type { ActionResult } from "@/types/actions";
import type { VehiclePhotoActionData } from "@/types/vehicle-media";

type VehiclePhotoFormState = ActionResult<VehiclePhotoActionData> | undefined;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function readVehicleId(formData: FormData): string | null {
  const value = formData.get("vehicleId");
  return typeof value === "string" && UUID_PATTERN.test(value.trim())
    ? value.trim()
    : null;
}

function vehiclePhotoErrorMessage(errorCode?: string): string {
  if (errorCode === "PGRST204" || errorCode === "42703" || errorCode === "404") {
    return "Vehicle photo storage is not configured. Apply the Supabase vehicle-media migration and try again.";
  }

  return "Could not save this vehicle photo. Please try again.";
}

async function removeStoredPhoto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  photoPath: string,
): Promise<boolean> {
  const result = await removeVehiclePhotoObject(supabase, photoPath);
  return result.success;
}

function revalidateVehicleMedia(vehicleId: string) {
  revalidatePath("/garage");
  revalidatePath(`/garage/${vehicleId}`);
}

export async function uploadVehiclePhoto(
  _previousState: VehiclePhotoFormState,
  formData: FormData,
): Promise<ActionResult<VehiclePhotoActionData>> {
  const vehicleId = readVehicleId(formData);
  if (!vehicleId) {
    return { success: false, error: "Select a valid vehicle for this photo." };
  }

  const fileValue = formData.get("photo");
  if (typeof File === "undefined" || !(fileValue instanceof File)) {
    return { success: false, error: "Choose a photo file before uploading." };
  }

  const validation = await validateVehiclePhoto(fileValue);
  if (!validation.success) {
    return validation;
  }

  let uploadedPhoto: {
    supabase: Awaited<ReturnType<typeof createClient>>;
    path: string;
  } | null = null;
  let photoReferenceSaved = false;

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Could not verify the current user for photo upload.", {
        code: authError.code,
      });
      return {
        success: false,
        error: "Unable to verify your session. Please try again.",
      };
    }

    if (!user) {
      return { success: false, error: "Sign in to upload a vehicle photo." };
    }

    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicles")
      .select("id, photo_path")
      .eq("id", vehicleId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (vehicleError) {
      console.error("Could not verify vehicle ownership for photo upload.", {
        code: vehicleError.code,
      });
      return {
        success: false,
        error:
          vehicleError.code === "PGRST204" || vehicleError.code === "42703"
            ? vehiclePhotoErrorMessage(vehicleError.code)
            : "Could not verify this vehicle. Please try again.",
      };
    }

    if (!vehicle) {
      return { success: false, error: "Vehicle not found in your garage." };
    }

    const photoPath = `${user.id}/${vehicle.id}/${randomUUID()}`;
    const uploadResult = await uploadVehiclePhotoObject(
      supabase,
      photoPath,
      fileValue,
      validation.data,
    );

    if (!uploadResult.success) {
      if (uploadResult.statusCode === "413") {
        return {
          success: false,
          error: `Vehicle photos must be ${MAX_VEHICLE_PHOTO_BYTES / 1024 / 1024} MB or smaller.`,
        };
      }
      return {
        success: false,
        error: vehiclePhotoErrorMessage(uploadResult.statusCode),
      };
    }
    uploadedPhoto = { supabase, path: photoPath };

    const updatedReference = vehicle.photo_path
      ? await supabase
          .from("vehicles")
          .update({
            photo_path: photoPath,
            updated_at: new Date().toISOString(),
          })
          .eq("id", vehicle.id)
          .eq("user_id", user.id)
          .eq("photo_path", vehicle.photo_path)
          .select("id")
          .maybeSingle()
      : await supabase
          .from("vehicles")
          .update({
            photo_path: photoPath,
            updated_at: new Date().toISOString(),
          })
          .eq("id", vehicle.id)
          .eq("user_id", user.id)
          .is("photo_path", null)
          .select("id")
          .maybeSingle();
    const { data: updatedVehicle, error: updateError } = updatedReference;

    if (updateError || !updatedVehicle) {
      if (updateError) {
        console.error("Could not save the vehicle photo reference.", {
          code: updateError.code,
        });
      }
      await removeStoredPhoto(supabase, photoPath);
      if (updateError) {
        return {
          success: false,
          error: vehiclePhotoErrorMessage(updateError.code),
        };
      }
      return {
        success: false,
        error:
          "The vehicle photo changed while uploading. Refresh and try again.",
      };
    }
    photoReferenceSaved = true;

    let notice: string | undefined;
    if (
      vehicle.photo_path &&
      !(await removeStoredPhoto(supabase, vehicle.photo_path))
    ) {
      notice = "Photo updated, but the previous stored photo could not be removed.";
    }

    const photoUrl = await getVehiclePhotoUrl(supabase, photoPath);
    if (!photoUrl) {
      notice ??= "Photo saved. Refresh the page if its preview does not appear.";
    }

    revalidateVehicleMedia(vehicleId);
    return {
      success: true,
      data: { photoPath, photoUrl, notice },
    };
  } catch (error) {
    console.error("Vehicle photo upload action failed.", error);
    if (uploadedPhoto && !photoReferenceSaved) {
      await removeStoredPhoto(uploadedPhoto.supabase, uploadedPhoto.path);
    }
    return {
      success: false,
      error: "Could not upload this vehicle photo. Please try again.",
    };
  }
}

export async function removeVehiclePhoto(
  _previousState: VehiclePhotoFormState,
  formData: FormData,
): Promise<ActionResult<VehiclePhotoActionData>> {
  const vehicleId = readVehicleId(formData);
  if (!vehicleId) {
    return { success: false, error: "Select a valid vehicle for this photo." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Could not verify the current user for photo removal.", {
        code: authError.code,
      });
      return {
        success: false,
        error: "Unable to verify your session. Please try again.",
      };
    }

    if (!user) {
      return { success: false, error: "Sign in to remove a vehicle photo." };
    }

    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicles")
      .select("id, photo_path")
      .eq("id", vehicleId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (vehicleError) {
      console.error("Could not verify vehicle ownership for photo removal.", {
        code: vehicleError.code,
      });
      return {
        success: false,
        error:
          vehicleError.code === "PGRST204" || vehicleError.code === "42703"
            ? vehiclePhotoErrorMessage(vehicleError.code)
            : "Could not verify this vehicle. Please try again.",
      };
    }

    if (!vehicle) {
      return { success: false, error: "Vehicle not found in your garage." };
    }

    if (!vehicle.photo_path) {
      return {
        success: true,
        data: { photoPath: null, photoUrl: null },
      };
    }

    const { data: updatedVehicle, error: updateError } = await supabase
      .from("vehicles")
      .update({ photo_path: null, updated_at: new Date().toISOString() })
      .eq("id", vehicle.id)
      .eq("user_id", user.id)
      .eq("photo_path", vehicle.photo_path)
      .select("id")
      .maybeSingle();

    if (updateError || !updatedVehicle) {
      if (updateError) {
        console.error("Could not clear the vehicle photo reference.", {
          code: updateError.code,
        });
        return {
          success: false,
          error: vehiclePhotoErrorMessage(updateError.code),
        };
      }
      return {
        success: false,
        error:
          "The vehicle photo changed before it could be removed. Refresh and try again.",
      };
    }

    if (!(await removeStoredPhoto(supabase, vehicle.photo_path))) {
      const { error: rollbackError } = await supabase
        .from("vehicles")
        .update({
          photo_path: vehicle.photo_path,
          updated_at: new Date().toISOString(),
        })
        .eq("id", vehicle.id)
        .eq("user_id", user.id)
        .is("photo_path", null);

      if (rollbackError) {
        console.error("Could not restore the vehicle photo reference.", {
          code: rollbackError.code,
        });
      }
      revalidateVehicleMedia(vehicleId);
      return {
        success: false,
        error: "Could not remove the vehicle photo. Please try again.",
      };
    }

    revalidateVehicleMedia(vehicleId);
    return {
      success: true,
      data: { photoPath: null, photoUrl: null },
    };
  } catch (error) {
    console.error("Vehicle photo removal action failed.", error);
    return {
      success: false,
      error: "Could not remove this vehicle photo. Please try again.",
    };
  }
}
