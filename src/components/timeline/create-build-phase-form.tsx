"use client";

import { useActionState, useEffect, useRef } from "react";
import { createBuildPhase } from "@/actions/build-timeline";

interface CreateBuildPhaseFormProps {
  vehicleId: string;
}

export function CreateBuildPhaseForm({
  vehicleId,
}: CreateBuildPhaseFormProps) {
  const [state, formAction, isPending] = useActionState(
    createBuildPhase,
    undefined,
  );
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state?.success) {
      return;
    }
    formRef.current?.reset();
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
  }, [state]);

  return (
    <details ref={detailsRef} className="build-timeline__add-phase">
      <summary className="build-timeline__add-phase-trigger">
        <span aria-hidden="true">+</span> ADD NEW PHASE
      </summary>
      <form ref={formRef} action={formAction} className="build-timeline__phase-form">
        <input type="hidden" name="vehicleId" value={vehicleId} />
        <label>
          <span>PHASE NAME</span>
          <input
            name="name"
            type="text"
            required
            maxLength={100}
            placeholder="Name this phase"
          />
        </label>
        <label>
          <span>DESCRIPTION <span className="build-timeline__optional">(OPTIONAL)</span></span>
          <textarea name="description" rows={2} maxLength={1500} />
        </label>
        <label>
          <span>TARGET COMPLETION <span className="build-timeline__optional">(OPTIONAL)</span></span>
          <input name="targetCompletionDate" type="date" />
        </label>
        {state && !state.success && (
          <p role="alert" className="build-timeline__error">
            {state.error}
          </p>
        )}
        {state?.success && (
          <p role="status" className="build-timeline__success">
            Phase created.
          </p>
        )}
        <button type="submit" className="button-primary" disabled={isPending}>
          {isPending ? "CREATING..." : "CREATE PHASE"}
        </button>
      </form>
    </details>
  );
}
