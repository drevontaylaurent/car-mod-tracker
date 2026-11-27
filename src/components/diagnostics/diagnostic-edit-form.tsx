"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateVehicleDiagnostic } from "@/actions/diagnostics";
import { SheetDialog } from "@/components/ui/sheet-dialog";
import {
  DIAGNOSTIC_SEVERITIES,
  DIAGNOSTIC_STATUSES,
  type UpdateDiagnosticInput,
  type VehicleDiagnostic,
} from "@/types/diagnostics";

interface DiagnosticEditFormProps {
  vehicleId: string;
  diagnostic: VehicleDiagnostic;
  onClose: () => void;
}

function capitalize(value: string): string {
  return value[0].toUpperCase() + value.slice(1);
}

export function DiagnosticEditForm({
  vehicleId,
  diagnostic,
  onClose,
}: DiagnosticEditFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const code = formData.get("code");
    const notes = formData.get("notes");
    const severity = DIAGNOSTIC_SEVERITIES.find(
      (option) => option === formData.get("severity"),
    );
    const status = DIAGNOSTIC_STATUSES.find(
      (option) => option === formData.get("status"),
    );
    if (
      typeof code !== "string" ||
      typeof notes !== "string" ||
      !severity ||
      !status
    ) {
      setErrorMessage("Enter a diagnostic code and valid details.");
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);
    try {
      const input: UpdateDiagnosticInput = {
        vehicleId,
        diagnosticId: diagnostic.id,
        code: code.trim().toUpperCase(),
        severity,
        notes,
        ...(status !== diagnostic.status ? { status } : {}),
      };
      const result = await updateVehicleDiagnostic(input);
      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }
      router.refresh();
      onClose();
    } catch (error) {
      console.error("Diagnostic details update request failed.", error);
      setErrorMessage("Could not update this diagnostic. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SheetDialog eyebrow="OBD-II" title="Edit Diagnostic" onClose={onClose}>
      <form onSubmit={handleSubmit} className="add-mod__form edit-sheet__form">
        <label className="field-label add-mod__label add-mod__wide">
          Diagnostic code *
          <input
            name="code"
            defaultValue={diagnostic.code}
            required
            maxLength={32}
            autoCapitalize="characters"
            spellCheck={false}
            className="field-control mt-2"
          />
        </label>
        <label className="field-label add-mod__label">
          Severity
          <select
            name="severity"
            defaultValue={diagnostic.severity}
            className="field-control mt-2"
          >
            {DIAGNOSTIC_SEVERITIES.map((option) => (
              <option key={option} value={option}>
                {capitalize(option)}
              </option>
            ))}
          </select>
        </label>
        <label className="field-label add-mod__label">
          Status
          <select
            name="status"
            defaultValue={diagnostic.status}
            className="field-control mt-2"
          >
            {DIAGNOSTIC_STATUSES.map((option) => (
              <option key={option} value={option}>
                {option === "resolved" ? "Fixed" : capitalize(option)}
              </option>
            ))}
          </select>
        </label>
        <label className="field-label add-mod__label add-mod__wide">
          Notes (optional)
          <textarea
            name="notes"
            defaultValue={diagnostic.notes ?? ""}
            maxLength={2000}
            rows={3}
            className="field-control mt-2"
          />
        </label>
        {errorMessage && (
          <p role="alert" className="state-message add-mod__wide" data-tone="error">
            {errorMessage}
          </p>
        )}
        <div className="add-mod__actions add-mod__wide">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="button-secondary"
          >
            Cancel
          </button>
          <button type="submit" disabled={isSaving} className="button-primary">
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </SheetDialog>
  );
}
