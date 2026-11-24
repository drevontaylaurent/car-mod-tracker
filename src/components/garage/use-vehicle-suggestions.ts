"use client";

import { useEffect, useMemo, useState } from "react";
import { getManualVehicleSuggestions } from "@/actions/vehicle-suggestions";
import type { ManualVehicleSuggestionRequest } from "@/types/nhtsa";

export type SuggestionStatus = "idle" | "loading" | "ready" | "error";

interface SuggestionResult {
  key: string;
  status: Exclude<SuggestionStatus, "idle" | "loading">;
  suggestions: string[];
}

interface SuggestionState {
  status: SuggestionStatus;
  suggestions: string[];
}

const EMPTY_SUGGESTIONS: SuggestionState = {
  status: "idle",
  suggestions: [],
};

function useSuggestionRequest(
  request: ManualVehicleSuggestionRequest | null,
  key: string,
  delay: number,
): SuggestionState {
  const [result, setResult] = useState<SuggestionResult | null>(null);
  const eligible = request !== null;
  const state =
    eligible && result?.key === key
      ? result
      : eligible
        ? { status: "loading" as const, suggestions: [] }
        : EMPTY_SUGGESTIONS;

  useEffect(() => {
    if (!request) {
      return;
    }

    let active = true;
    const timeout = setTimeout(() => {
      void getManualVehicleSuggestions(request)
        .then((response) => {
          if (!active) {
            return;
          }
          setResult({
            key,
            status: response.success ? "ready" : "error",
            suggestions: response.success ? response.data : [],
          });
        })
        .catch((error: unknown) => {
          console.error("Vehicle suggestion request failed.", error);
          if (active) {
            setResult({ key, status: "error", suggestions: [] });
          }
        });
    }, delay);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [delay, key, request]);

  return state;
}

export function useVehicleSuggestions(
  year: string,
  make: string,
  enabled: boolean,
) {
  const normalizedMake = make.trim();
  const makeKey = normalizedMake.toLowerCase();
  const makeRequest = useMemo<ManualVehicleSuggestionRequest | null>(
    () =>
      enabled && makeKey.length >= 2
        ? { type: "make", query: normalizedMake }
        : null,
    [enabled, makeKey, normalizedMake],
  );
  const makeSuggestions = useSuggestionRequest(makeRequest, makeKey, 350);

  const modelYear = Number(year);
  const hasValidYear =
    /^\d{4}$/.test(year.trim()) &&
    Number.isInteger(modelYear) &&
    modelYear >= 1886 &&
    modelYear <= new Date().getFullYear() + 1;
  const modelKey = `${hasValidYear ? modelYear : ""}:${makeKey}`;
  const modelRequest = useMemo<ManualVehicleSuggestionRequest | null>(
    () =>
      enabled && hasValidYear && makeKey.length >= 2
        ? { type: "model", year: modelYear, make: normalizedMake }
        : null,
    [enabled, hasValidYear, makeKey, modelYear, normalizedMake],
  );
  const modelSuggestions = useSuggestionRequest(modelRequest, modelKey, 500);

  return { make: makeSuggestions, model: modelSuggestions };
}
