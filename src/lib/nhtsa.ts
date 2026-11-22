import type { ActionResult } from "@/types/actions";
import type {
  DecodedVehicleInfo,
  NhtsaVinDecodeResponse,
  NhtsaVinDecodeResult,
} from "@/types/nhtsa";

const VIN_DECODE_ENDPOINT =
  "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNhtsaVinDecodeResult(value: unknown): value is NhtsaVinDecodeResult {
  if (!isRecord(value)) {
    return false;
  }

  return ["ModelYear", "Make", "Model", "Trim"].every((field) => {
    const fieldValue = value[field];
    return (
      fieldValue === undefined ||
      fieldValue === null ||
      typeof fieldValue === "string"
    );
  });
}

function isNhtsaVinDecodeResponse(
  value: unknown,
): value is NhtsaVinDecodeResponse {
  return (
    isRecord(value) &&
    Array.isArray(value.Results) &&
    value.Results.every(isNhtsaVinDecodeResult)
  );
}

function normalizeText(value: string | null | undefined): string | null {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : null;
}

function normalizeYear(value: string | null | undefined): number | null {
  const normalizedValue = normalizeText(value);
  if (!normalizedValue || !/^\d{4}$/.test(normalizedValue)) {
    return null;
  }

  const year = Number(normalizedValue);
  return year >= 1886 && year <= new Date().getFullYear() + 1 ? year : null;
}

export async function decodeVin(
  vin: string,
): Promise<ActionResult<DecodedVehicleInfo>> {
  if (
    typeof vin !== "string" ||
    vin.length !== 17 ||
    !/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)
  ) {
    return {
      success: false,
      error: "VIN must be exactly 17 alphanumeric characters and cannot contain I, O, or Q.",
    };
  }

  try {
    const endpoint = `${VIN_DECODE_ENDPOINT}/${encodeURIComponent(vin.toUpperCase())}?format=json`;
    const response = await fetch(endpoint, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error("NHTSA VIN lookup returned an error status.", response.status);
      return {
        success: false,
        error: "The VIN lookup service is unavailable. Please try again.",
      };
    }

    const payload: unknown = await response.json();
    if (!isNhtsaVinDecodeResponse(payload) || payload.Results.length === 0) {
      console.error("NHTSA VIN lookup returned an unexpected response.");
      return {
        success: false,
        error: "The VIN lookup service returned an unexpected response.",
      };
    }

    const result = payload.Results[0];
    if (!result) {
      return {
        success: false,
        error: "No vehicle data was returned for this VIN.",
      };
    }

    return {
      success: true,
      data: {
        year: normalizeYear(result.ModelYear),
        make: normalizeText(result.Make),
        model: normalizeText(result.Model),
        trim: normalizeText(result.Trim),
      },
    };
  } catch (error) {
    console.error("NHTSA VIN lookup failed.", error);
    return {
      success: false,
      error: "The VIN lookup service is unavailable. Please try again.",
    };
  }
}
