import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActionResult } from "@/types/actions";
import type { Database, Vehicle } from "@/types/database";
import type {
  VehiclePhotoMimeType,
  VehiclePhotoStorageResult,
  VehicleWithMedia,
} from "@/types/vehicle-media";
import {
  MAX_VEHICLE_PHOTO_BYTES,
  VEHICLE_PHOTO_BUCKET,
  VEHICLE_PHOTO_MIME_TYPES,
} from "@/lib/vehicle-media-constants";

type VehicleMediaClient = SupabaseClient<Database>;

export async function getVehiclePhotoUrl(
  supabase: VehicleMediaClient,
  photoPath: string | null | undefined,
): Promise<string | null> {
  if (!photoPath) {
    return null;
  }

  try {
    const { data, error } = await supabase.storage
      .from(VEHICLE_PHOTO_BUCKET)
      .createSignedUrl(photoPath, 60 * 60);

    if (error) {
      console.error("Could not create a signed vehicle photo URL.", error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error("Vehicle photo URL lookup failed.", error);
    return null;
  }
}

export async function withVehiclePhotoUrl(
  supabase: VehicleMediaClient,
  vehicle: Vehicle,
): Promise<VehicleWithMedia> {
  return {
    ...vehicle,
    photoUrl: await getVehiclePhotoUrl(supabase, vehicle.photo_path),
  };
}

export async function uploadVehiclePhotoObject(
  supabase: VehicleMediaClient,
  photoPath: string,
  file: File,
  mimeType: VehiclePhotoMimeType,
): Promise<VehiclePhotoStorageResult> {
  try {
    const { error } = await supabase.storage
      .from(VEHICLE_PHOTO_BUCKET)
      .upload(photoPath, file, {
        cacheControl: "3600",
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error("Vehicle photo upload failed.", error);
      return { success: false, statusCode: error.statusCode };
    }

    return { success: true, data: null };
  } catch (error) {
    console.error("Vehicle photo storage request failed.", error);
    return { success: false };
  }
}

export async function removeVehiclePhotoObject(
  supabase: VehicleMediaClient,
  photoPath: string,
): Promise<VehiclePhotoStorageResult> {
  try {
    const { error } = await supabase.storage
      .from(VEHICLE_PHOTO_BUCKET)
      .remove([photoPath]);

    if (error) {
      console.error("Could not remove a vehicle photo object.", error);
      return { success: false, statusCode: error.statusCode };
    }

    return { success: true, data: null };
  } catch (error) {
    console.error("Vehicle photo removal request failed.", error);
    return { success: false };
  }
}

export async function validateVehiclePhoto(
  file: File,
): Promise<ActionResult<VehiclePhotoMimeType>> {
  if (file.size === 0) {
    return { success: false, error: "Choose a photo file before uploading." };
  }

  if (file.size > MAX_VEHICLE_PHOTO_BYTES) {
    return {
      success: false,
      error: "Vehicle photos must be 4 MB or smaller.",
    };
  }

  const mimeType = VEHICLE_PHOTO_MIME_TYPES.find(
    (supportedType) => supportedType === file.type.toLowerCase(),
  );
  if (!mimeType) {
    return {
      success: false,
      error: "Use a JPEG, PNG, WebP, or AVIF image.",
    };
  }

  const signature = new Uint8Array(
    await file.slice(0, 32).arrayBuffer(),
  );
  if (!matchesImageSignature(mimeType, signature)) {
    return {
      success: false,
      error: "The selected file content does not match its image type.",
    };
  }

  return { success: true, data: mimeType };
}

function matchesImageSignature(
  mimeType: VehiclePhotoMimeType,
  signature: Uint8Array,
): boolean {
  if (mimeType === "image/jpeg") {
    return signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff;
  }

  if (mimeType === "image/png") {
    return (
      signature.length >= 8 &&
      signature[0] === 0x89 &&
      signature[1] === 0x50 &&
      signature[2] === 0x4e &&
      signature[3] === 0x47 &&
      signature[4] === 0x0d &&
      signature[5] === 0x0a &&
      signature[6] === 0x1a &&
      signature[7] === 0x0a
    );
  }

  const header = String.fromCharCode(...signature);
  if (mimeType === "image/webp") {
    return header.startsWith("RIFF") && header.slice(8, 12) === "WEBP";
  }

  return (
    header.slice(4, 8) === "ftyp" &&
    (header.slice(8).includes("avif") || header.slice(8).includes("avis"))
  );
}
