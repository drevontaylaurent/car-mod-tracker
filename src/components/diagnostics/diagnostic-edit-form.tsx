"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateVehicleDiagnostic } from "@/actions/diagnostics";
import {
  DIAGNOSTIC_SEVERITIES,
  type DiagnosticSeverity,
  type UpdateDiagnosticInput,
  type VehicleDiagnostic,
} from "@/types/diagnostics";

interface DiagnosticEditFormProps {
  vehicleId: string;
  diagnostic: VehicleDiagnostic;
}

export function DiagnosticEditForm({
  vehicleId,
  diagnostic,
}: DiagnosticEditFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [code, setCode] = useState(diagnostic.code);
  const [severity, setSeverity] = useState<DiagnosticSeverity>(
    diagnostic.severity,
  );
  const router = useRouter();

  function handleCodeChange(event: ChangeEvent<HTMLInputElement>) {
    setCode(event.currentTarget.value.toUpperCase());
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const submittedCode = formData.get("code");
    const notes = formData.get("notes");
    if (typeof submittedCode !== "string" || typeof notes !== "string") {
      setErrorMessage("Enter a diagnostic code and valid notes.");
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);
    try {
      const input: UpdateDiagnosticInput = {
        vehicleId,
        diagnosticId: diagnostic.id,
        code: submittedCode,
        severity,
        notes,
      };
      const result = await updateVehicleDiagnostic(input);
      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }
      router.refresh();
    } catch (error) {
      console.error("Diagnostic details update request failed.", error);
      setErrorMessage("Could not update this diagnostic. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="open-build__diagnostic-edit" onSubmit={handleSubmit}>
      <label>
        <span>Diagnostic code</span>
        <input
          name="code"
          value={code}
          onChange={handleCodeChange}
          onBlur={() => setCode((currentCode) => currentCode.trim().toUpperCase())}
          required
          maxLength={32}
          autoCapitalize="characters"
          spellCheck={false}
        />
      </label>
      <label>
        <span>Severity</span>
        <select
          name="severity"
          value={severity}
          onChange={(event) => {
            const selected = DIAGNOSTIC_SEVERITIES.find(
              (option) => option === event.currentTarget.value,
            );
            if (selected) {
              setSeverity(selected);
            }
          }}
          required
        >
          {DIAGNOSTIC_SEVERITIES.map((option) => (
            <option key={option} value={option}>
              {option[0].toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Notes</span>
        <textarea
          name="notes"
          defaultValue={diagnostic.notes ?? ""}
          maxLength={2000}
          rows={2}
        />
      </label>
      {errorMessage && (
        <p role="alert" className="open-build__diagnostic-error">
          {errorMessage}
        </p>
      )}
      <button type="submit" className="button-secondary" disabled={isSaving}>
        {isSaving ? "SAVING..." : "SAVE DETAILS"}
      </button>
    </form>
  );
}
