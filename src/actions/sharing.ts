"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/actions";
import type { BuildShare, SharedBuild, SharedModification } from "@/types/sharing";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getProfileIdentity(): Promise<
  ActionResult<{ label: string }>
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { success: false, error: "Unable to verify your session." };
    }

    const emailName = user.email?.split("@")[0]?.trim();
    const displayName =
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name.trim()
        : typeof user.user_metadata?.name === "string"
          ? user.user_metadata.name.trim()
          : "";

    return {
      success: true,
      data: { label: displayName || emailName || "Authenticated builder" },
    };
  } catch (error) {
    console.error("Could not load profile identity.", error);
    return { success: false, error: "Unable to load your profile." };
  }
}

export async function enableVehicleShare(
  vehicleId: string,
): Promise<ActionResult<BuildShare>> {
  if (!UUID_PATTERN.test(vehicleId)) {
    return { success: false, error: "Select a valid vehicle to share." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Sign in to share a vehicle build." };
    }

    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicles")
      .select("id")
      .eq("id", vehicleId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (vehicleError || !vehicle) {
      return { success: false, error: "Vehicle not found in your garage." };
    }

    const { data: existing, error: existingError } = await supabase
      .from("build_shares")
      .select("id, vehicle_id, share_token, is_enabled")
      .eq("vehicle_id", vehicleId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingError && existingError.code !== "PGRST116") {
      console.error("Could not load build share.", existingError);
      return sharingStorageError(existingError.code);
    }

    const result = existing
      ? await supabase
          .from("build_shares")
          .update({
            is_enabled: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .eq("user_id", user.id)
          .select("id, vehicle_id, share_token, is_enabled")
          .single()
      : await supabase
          .from("build_shares")
          .insert({
            vehicle_id: vehicleId,
            user_id: user.id,
            share_token: randomUUID(),
            is_enabled: true,
          })
          .select("id, vehicle_id, share_token, is_enabled")
          .single();

    if (result.error) {
      console.error("Could not enable build sharing.", result.error);
      return sharingStorageError(result.error.code);
    }

    revalidatePath("/profile");
    return {
      success: true,
      data: {
        id: result.data.id,
        vehicleId: result.data.vehicle_id,
        token: result.data.share_token,
        isEnabled: result.data.is_enabled,
      },
    };
  } catch (error) {
    console.error("Build sharing failed.", error);
    return { success: false, error: "Could not create a build share link." };
  }
}

export async function getSharedBuild(
  token: string,
): Promise<ActionResult<SharedBuild>> {
  if (!UUID_PATTERN.test(token)) {
    return { success: false, error: "This shared build is unavailable." };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_shared_build", {
      p_token: token,
    });

    if (error) {
      console.error("Could not load shared build.", error);
      return { success: false, error: "This shared build is unavailable." };
    }

    if (!isSharedBuild(data)) {
      return { success: false, error: "This shared build is unavailable." };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Shared build lookup failed.", error);
    return { success: false, error: "This shared build is unavailable." };
  }
}

function sharingStorageError(code?: string): ActionResult<never> {
  return {
    success: false,
    error:
      code === "PGRST205" || code === "42P01"
        ? "Build sharing is not configured yet. Apply the build sharing migration."
        : "Could not create a build share link.",
  };
}

function isSharedModification(value: unknown): value is SharedModification {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.name === "string" &&
    typeof item.category === "string" &&
    (item.status === "Installed" ||
      item.status === "Ordered" ||
      item.status === "Wishlist")
  );
}

function isSharedBuild(value: unknown): value is SharedBuild {
  if (!value || typeof value !== "object") return false;
  const build = value as Record<string, unknown>;
  return (
    (build.nickname === null || typeof build.nickname === "string") &&
    (build.year === null ||
      (typeof build.year === "number" && Number.isFinite(build.year))) &&
    (build.make === null || typeof build.make === "string") &&
    (build.model === null || typeof build.model === "string") &&
    (build.trim === null || typeof build.trim === "string") &&
    typeof build.totalModCount === "number" &&
    typeof build.installedCount === "number" &&
    typeof build.progress === "number" &&
    Array.isArray(build.modifications) &&
    build.modifications.every(isSharedModification)
  );
}
