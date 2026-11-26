"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteBuildPhase } from "@/actions/build-timeline";
import { EditBuildPhaseForm } from "@/components/timeline/edit-build-phase-form";
import { ActionMenu } from "@/components/ui/action-menu";
import type { BuildPhase } from "@/types/build-timeline";

interface BuildPhaseManagementProps {
  vehicleId: string;
  phase: BuildPhase;
}

export function BuildPhaseManagement({
  vehicleId,
  phase,
}: BuildPhaseManagementProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    if (
      !window.confirm(
        `Delete "${phase.name}"? Its modifications will stay in this build and become unassigned.`,
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);
    try {
      const result = await deleteBuildPhase(vehicleId, phase.id);
      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }
      router.refresh();
    } catch (error) {
      console.error("Build phase deletion request failed.", error);
      setErrorMessage("Could not delete this phase. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <ActionMenu
        label={`More actions for phase ${phase.name}`}
        disabled={isDeleting}
        items={[
          { key: "edit", label: "Edit Phase", onSelect: () => setIsEditing(true) },
          {
            key: "delete",
            label: "Delete Phase",
            destructive: true,
            onSelect: () => void handleDelete(),
          },
        ]}
      />
      {errorMessage && (
        <p role="alert" className="build-timeline__error">
          {errorMessage}
        </p>
      )}
      {isEditing && (
        <EditBuildPhaseForm
          vehicleId={vehicleId}
          phase={phase}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
}