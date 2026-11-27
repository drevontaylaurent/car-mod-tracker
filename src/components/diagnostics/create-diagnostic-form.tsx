"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createVehicleDiagnostic } from "@/actions/diagnostics";
import { DIAGNOSTIC_SEVERITIES } from "@/types/diagnostics";

interface CreateDiagnosticFormProps {
  vehicleId: string;
}

function getLocalDateValue(): string {
  const now = new Date();
  const localDate = new Date(
    now.getTime() - now.getTimezoneOffset() * 60_000,
  );
  return localDate.toISOString().slice(0, 10);
}

export function CreateDiagnosticForm({ vehicleId }: CreateDiagnosticFormProps) {
  const [state, formAction, isPending] = useActionState(
    createVehicleDiagnostic,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const recordedDateRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (recordedDateRef.current) {
      recordedDateRef.current.value = getLocalDateValue();
    }
  }, []);

  useEffect(() => {
    if (!state?.success) {
      return;
    }
    formRef.current?.reset();
    if (recordedDateRef.current) {
      recordedDateRef.current.value = getLocalDateValue();
    }
    router.refresh();
  }, [router, state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="open-build__diagnostic-form"
      aria-label="Add diagnostic code"
    >
      <input type="hidden" name="vehicleId" value={vehicleId} />
      <label className="open-build__diagnostic-field">
        <span className="sr-only">Diagnostic code</span>
        <input
          name="code"
          type="text"
          onBlur={(event) => {
            event.currentTarget.value = event.currentTarget.value
              .trim()
              .toUpperCase();
          }}
          required
          maxLength={32}
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="P0171"
        />
      </label>
      <label className="open-build__diagnostic-field">
        <span className="sr-only">Severity</span>
        <select
          name="severity"
          defaultValue=""
          required
        >
          <option value="" disabled>
            Choose severity
          </option>
          {DIAGNOSTIC_SEVERITIES.map((option) => (
            <option key={option} value={option}>
              {option[0].toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
      </label>
      <label className="open-build__diagnostic-field">
        <span>Recorded date</span>
        <input ref={recordedDateRef} name="recorded_date" type="date" />
      </label>
      <button type="submit" className="button-primary" disabled={isPending}>
        {isPending ? "ADDING..." : "Add"}
      </button>
      {state && !state.success && (
        <p role="alert" className="open-build__diagnostic-error">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p role="status" className="open-build__diagnostic-success">
          Diagnostic added.
        </p>
      )}
    </form>
  );
}
