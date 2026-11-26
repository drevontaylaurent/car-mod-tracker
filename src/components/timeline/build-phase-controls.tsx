"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateBuildPhaseStatus } from "@/actions/build-timeline";
import {
  BUILD_PHASE_STATUSES,
  type BuildPhase,
  type BuildPhaseStatus,
} from "@/types/build-timeline";

interface BuildPhaseControlsProps {
  vehicleId: string;
  phase: BuildPhase;
  installedModCount: number;
  totalModCount: number;
}

function statusLabel(status: BuildPhaseStatus): string {
  if (status === "in_progress") {
    return "In Progress";
  }
  return status[0].toUpperCase() + status.slice(1);
}

export function BuildPhaseControls({
  vehicleId,
  phase,
  installedModCount,
  totalModCount,
}: BuildPhaseControlsProps) {
  const [status, setStatus] = useState(phase.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleStatusChange(value: string) {
    const nextStatus = BUILD_PHASE_STATUSES.find(
      (candidate) => candidate === value,
    );
    if (!nextStatus || nextStatus === status) {
      return;
    }

    setIsUpdating(true);
    setErrorMessage(null);
    try {
      const result = await updateBuildPhaseStatus(
        vehicleId,
        phase.id,
        nextStatus,
      );
      if (!result.success) {
        setErrorMessage(result.error);
        setStatus(phase.status);
        return;
      }
      setStatus(result.data.status);
      router.refresh();
    } catch (error) {
      console.error("Build phase status request failed.", error);
      setErrorMessage("Could not update this phase status. Please try again.");
      setStatus(phase.status);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <>
      <div className="build-timeline__phase-meta">
        <label>
          <span className="sr-only">Status for phase {phase.position}</span>
          <select
            value={status}
            onChange={(event) =>
              void handleStatusChange(event.currentTarget.value)
            }
            disabled={isUpdating}
            data-status={status}
          >
            {BUILD_PHASE_STATUSES.map((value) => (
              <option key={value} value={value}>
                {statusLabel(value)}
              </option>
            ))}
          </select>
        </label>
        <p>
          {totalModCount > 0
            ? `${installedModCount} / ${totalModCount} modifications installed`
            : "No modifications assigned"}
        </p>
      </div>
      {errorMessage && (
        <p role="alert" className="build-timeline__error">
          {errorMessage}
        </p>
      )}
    </>
  );
}
