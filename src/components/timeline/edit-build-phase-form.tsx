"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateBuildPhase } from "@/actions/build-timeline";
import type { BuildPhase } from "@/types/build-timeline";

interface EditBuildPhaseFormProps {
  vehicleId: string;
  phase: BuildPhase;
}

export function EditBuildPhaseForm({
  vehicleId,
  phase,
}: EditBuildPhaseFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    const description = formData.get("description");
    const targetCompletionDate = formData.get("targetCompletionDate");
    if (
      typeof name !== "string" ||
      typeof description !== "string" ||
      typeof targetCompletionDate !== "string"
    ) {
      setErrorMessage("Enter valid phase details.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSaved(false);
    try {
      const result = await updateBuildPhase({
        vehicleId,
        phaseId: phase.id,
        name,
        description: description || null,
        targetCompletionDate: targetCompletionDate || null,
      });
      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    } catch (error) {
      console.error("Build phase detail update request failed.", error);
      setErrorMessage("Could not save phase details. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <details className="build-timeline__edit-details">
      <summary>Edit phase details</summary>
      <form className="build-timeline__phase-form" onSubmit={handleSubmit}>
        <label>
          <span>PHASE NAME</span>
          <input
            name="name"
            type="text"
            required
            maxLength={100}
            defaultValue={phase.name}
          />
        </label>
        <label>
          <span>DESCRIPTION <span className="build-timeline__optional">(OPTIONAL)</span></span>
          <textarea
            name="description"
            rows={2}
            maxLength={1500}
            defaultValue={phase.description ?? ""}
          />
        </label>
        <label>
          <span>TARGET COMPLETION <span className="build-timeline__optional">(OPTIONAL)</span></span>
          <input
            name="targetCompletionDate"
            type="date"
            defaultValue={phase.target_completion_date ?? ""}
          />
        </label>
        {errorMessage && (
          <p role="alert" className="build-timeline__error">
            {errorMessage}
          </p>
        )}
        {saved && (
          <p role="status" className="build-timeline__success">
            Phase details saved.
          </p>
        )}
        <button type="submit" className="button-secondary" disabled={isSaving}>
          {isSaving ? "SAVING..." : "SAVE DETAILS"}
        </button>
      </form>
    </details>
  );
}
