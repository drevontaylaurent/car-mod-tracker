"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getNhtsaMakeSuggestions,
  getNhtsaModelSuggestions,
} from "@/lib/nhtsa";
import type { ActionResult } from "@/types/actions";
import type { ManualVehicleSuggestionRequest } from "@/types/nhtsa";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readSuggestionRequest(
  value: unknown,
): ActionResult<ManualVehicleSuggestionRequest> {
  if (!isRecord(value)) {
    return { success: false, error: "Enter a valid vehicle detail." };
  }

  if (value.type === "make" && typeof value.query === "string") {
    const query = value.query.trim();
    if (query.length < 2 || query.length > 100) {
      return { success: false, error: "Enter at least two Make characters." };
    }
    return { success: true, data: { type: "make", query } };
  }

  if (
    value.type === "model" &&
    typeof value.year === "number" &&
    Number.isInteger(value.year) &&
    value.year >= 1886 &&
    value.year <= new Date().getFullYear() + 1 &&
    typeof value.make === "string" &&
    value.make.trim().length >= 2 &&
    value.make.trim().length <= 100
  ) {
    return {
      success: true,
      data: { type: "model", year: value.year, make: value.make.trim() },
    };
  }

  return { success: false, error: "Enter a valid vehicle detail." };
}

export async function getManualVehicleSuggestions(
  value: unknown,
): Promise<ActionResult<string[]>> {
  const request = readSuggestionRequest(value);
  if (!request.success) {
    return request;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Could not verify the user for vehicle suggestions.", {
        code: error.code,
      });
      return {
        success: false,
        error: "Suggestions are unavailable. You can enter details manually.",
      };
    }
    if (!user) {
      return {
        success: false,
        error: "Suggestions are unavailable. You can enter details manually.",
      };
    }

    return request.data.type === "make"
      ? getNhtsaMakeSuggestions(request.data.query)
      : getNhtsaModelSuggestions(request.data.year, request.data.make);
  } catch (error) {
    console.error("Vehicle suggestions failed.", error);
    return {
      success: false,
      error: "Suggestions are unavailable. You can enter details manually.",
    };
  }
}
