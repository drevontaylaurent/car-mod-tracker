"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  deleteVehicleDiagnostic,
  resolveVehicleDiagnostic,
  updateVehicleDiagnostic,
} from "@/actions/diagnostics";
import type { ActionResult } from "@/types/actions";
import {
  DIAGNOSTIC_STATUSES,
  type VehicleDiagnostic,
} from "@/types/diagnostics";

interface DiagnosticRowControlsProps {
  vehicleId: string;
  diagnostic: VehicleDiagnostic;
}

export function DiagnosticRowControls({
  vehicleId,
  diagnostic,
}: DiagnosticRowControlsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  async function runAction<T>(
    action: () => Promise<ActionResult<T>>,
    failureMessage: string,
  ) {
    setErrorMessage(null);
    setIsUpdating(true);
    try {
      const result = await action();
      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }
      router.refresh();
    } catch (error) {
      console.error("Diagnostic action request failed.", error);
      setErrorMessage(failureMessage);
    } finally {
      setIsUpdating(false);
    }
  }

  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    const status = DIAGNOSTIC_STATUSES.find(
      (candidate) => candidate === event.currentTarget.value,
    );
    if (status) {
      void runAction(
        () =>
          updateVehicleDiagnostic({
            vehicleId,
            diagnosticId: diagnostic.id,
            status,
          }),
        "Could not update this diagnostic. Please try again.",
      );
    }
  }

  function handleResolve() {
    void runAction(
      () => resolveVehicleDiagnostic(vehicleId, diagnostic.id),
      "Could not mark this diagnostic fixed. Please try again.",
    );
  }

  function handleDelete() {
    if (!window.confirm(`Delete diagnostic ${diagnostic.code}?`)) {
      return;
    }
    void runAction(
      () => deleteVehicleDiagnostic(vehicleId, diagnostic.id),
      "Could not delete this diagnostic. Please try again.",
    );
  }

  return (
    <div className="open-build__diagnostic-controls" aria-busy={isUpdating}>
      <label>
        <span className="sr-only">Status for {diagnostic.code}</span>
        <select
          value={diagnostic.status}
          onChange={handleStatusChange}
          disabled={isUpdating}
        >
          {DIAGNOSTIC_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status === "resolved"
                ? "Fixed"
                : status[0].toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </label>
      {diagnostic.status !== "resolved" && (
        <button
          type="button"
          className="open-build__diagnostic-resolve"
          onClick={handleResolve}
          disabled={isUpdating}
        >
          MARK FIXED
        </button>
      )}
      <button
        type="button"
        className="open-build__diagnostic-delete"
        onClick={handleDelete}
        disabled={isUpdating}
      >
        DELETE
      </button>
      {errorMessage && (
        <p role="alert" className="open-build__diagnostic-error">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
