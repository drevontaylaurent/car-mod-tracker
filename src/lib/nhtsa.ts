import { cacheLife } from "next/cache";
import type { ActionResult } from "@/types/actions";
import type {
  DecodedVehicleInfo,
  NhtsaMakeResult,
  NhtsaModelResult,
  NhtsaVinDecodeResponse,
  NhtsaVinDecodeResult,
} from "@/types/nhtsa";

const NHTSA_API_BASE = "https://vpic.nhtsa.dot.gov/api/vehicles";
const VIN_DECODE_ENDPOINT =
  `${NHTSA_API_BASE}/DecodeVinValues`;

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

function isNhtsaMakeResult(value: unknown): value is NhtsaMakeResult {
  return (
    isRecord(value) &&
    typeof value.Make_ID === "number" &&
    Number.isInteger(value.Make_ID) &&
    value.Make_ID > 0 &&
    typeof value.Make_Name === "string" &&
    value.Make_Name.trim().length > 0
  );
}

function isNhtsaModelResult(value: unknown): value is NhtsaModelResult {
  return (
    isRecord(value) &&
    typeof value.Make_ID === "number" &&
    Number.isInteger(value.Make_ID) &&
    value.Make_ID > 0 &&
    typeof value.Make_Name === "string" &&
    typeof value.Model_ID === "number" &&
    Number.isInteger(value.Model_ID) &&
    value.Model_ID > 0 &&
    typeof value.Model_Name === "string" &&
    value.Make_Name.trim().length > 0 &&
    value.Model_Name.trim().length > 0
  );
}

function readResults(payload: unknown): unknown[] | null {
  return isRecord(payload) && Array.isArray(payload.Results)
    ? payload.Results
    : null;
}

async function getCachedNhtsaMakes(): Promise<NhtsaMakeResult[]> {
  "use cache";
  cacheLife("days");

  const response = await fetch(`${NHTSA_API_BASE}/GetAllMakes?format=json`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    throw new Error(`NHTSA make lookup returned status ${response.status}.`);
  }

  const results = readResults(await response.json());
  if (!results) {
    throw new Error("NHTSA make lookup returned an unexpected response.");
  }

  const makes = results.filter(isNhtsaMakeResult);
  if (makes.length === 0) {
    throw new Error("NHTSA make lookup returned no valid results.");
  }
  return makes;
}

async function getCachedNhtsaModels(
  year: number,
  make: string,
): Promise<NhtsaModelResult[]> {
  "use cache";
  cacheLife("days");

  const endpoint = `${NHTSA_API_BASE}/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`;
  const response = await fetch(endpoint, {
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    throw new Error(`NHTSA model lookup returned status ${response.status}.`);
  }

  const results = readResults(await response.json());
  if (!results) {
    throw new Error("NHTSA model lookup returned an unexpected response.");
  }
  return results.filter(isNhtsaModelResult);
}

export async function getNhtsaMakeSuggestions(
  query: string,
): Promise<ActionResult<string[]>> {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length < 2) {
    return { success: true, data: [] };
  }

  try {
    const makes = await getCachedNhtsaMakes();
    const suggestions = Array.from(
      new Set(
        makes
          .map((result) => result.Make_Name.trim())
          .filter((name) => name.toLowerCase().startsWith(normalizedQuery)),
      ),
    )
      .sort((left, right) => left.length - right.length)
      .slice(0, 8);

    return { success: true, data: suggestions };
  } catch (error) {
    console.error("NHTSA Make suggestions failed.", error);
    return {
      success: false,
      error: "NHTSA suggestions are unavailable. Enter the Make manually.",
    };
  }
}

export async function getNhtsaModelSuggestions(
  year: number,
  make: string,
): Promise<ActionResult<string[]>> {
  const normalizedMake = make.trim().toLowerCase();
  if (
    !Number.isInteger(year) ||
    year < 1886 ||
    year > new Date().getFullYear() + 1 ||
    normalizedMake.length < 2
  ) {
    return { success: true, data: [] };
  }

  try {
    const makes = await getCachedNhtsaMakes();
    const canonicalMake = makes.find(
      (result) => result.Make_Name.trim().toLowerCase() === normalizedMake,
    )?.Make_Name.trim();

    if (!canonicalMake) {
      return { success: true, data: [] };
    }

    const models = await getCachedNhtsaModels(year, canonicalMake);
    const suggestions = Array.from(
      new Set(
        models
          .filter(
            (result) =>
              result.Make_Name.trim().toLowerCase() === normalizedMake,
          )
          .map((result) => result.Model_Name.trim()),
      ),
    );

    return { success: true, data: suggestions };
  } catch (error) {
    console.error("NHTSA Model suggestions failed.", error);
    return {
      success: false,
      error: "NHTSA suggestions are unavailable. Enter the Model manually.",
    };
  }
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
