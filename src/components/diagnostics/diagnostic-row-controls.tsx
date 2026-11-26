"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteVehicleDiagnostic,
  resolveVehicleDiagnostic,
  updateVehicleDiagnostic,
} from "@/actions/diagnostics";
import { DiagnosticEditForm } from "@/components/diagnostics/diagnostic-edit-form";
import { ActionMenu, type ActionMenuItem } from "@/components/ui/action-menu";
import type { ActionResult } from "@/types/actions";
import type { VehicleDiagnostic } from "@/types/diagnostics";

interface DiagnosticRowControlsProps {
  vehicleId: string;
  diagnostic: VehicleDiagnostic;
}

export function DiagnosticRowControls({
  vehicleId,
  diagnostic,
}: DiagnosticRowControlsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const isResolved = diagnostic.status === "resolved";

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

  function handleDelete() {
    if (!window.confirm(`Delete diagnostic ${diagnostic.code}?`)) {
      return;
    }
    void runAction(
      () => deleteVehicleDiagnostic(vehicleId, diagnostic.id),
      "Could not delete this diagnostic. Please try again.",
    );
  }

  const stateItem: ActionMenuItem = isResolved
    ? {
        key: "reopen",
        label: "Reopen",
        onSelect: () =>
          void runAction(
            () =>
              updateVehicleDiagnostic({
                vehicleId,
                diagnosticId: diagnostic.id,
                status: "active",
              }),
            "Could not reopen this diagnostic. Please try again.",
          ),
      }
    : {
        key: "fix",
        label: "Mark Fixed",
        onSelect: () =>
          void runAction(
            () => resolveVehicleDiagnostic(vehicleId, diagnostic.id),
            "Could not mark this diagnostic fixed. Please try again.",
          ),
      };

  return (
    <>
      <ActionMenu
        label={`More actions for diagnostic ${diagnostic.code}`}
        disabled={isUpdating}
        items={[
          { key: "edit", label: "Edit", onSelect: () => setIsEditing(true) },
          stateItem,
          {
            key: "delete",
            label: "Delete",
            destructive: true,
            onSelect: handleDelete,
          },
        ]}
      />
      {errorMessage && (
        <p role="alert" className="open-build__diagnostic-error">
          {errorMessage}
        </p>
      )}
      {isEditing && (
        <DiagnosticEditForm
          vehicleId={vehicleId}
          diagnostic={diagnostic}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
}
