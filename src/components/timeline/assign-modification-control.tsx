"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { assignModificationToPhase } from "@/actions/build-timeline";
import type { Mod } from "@/types/database";

interface AssignModificationControlProps {
  vehicleId: string;
  phaseId: string;
  availableMods: Mod[];
}

export function AssignModificationControl({
  vehicleId,
  phaseId,
  availableMods,
}: AssignModificationControlProps) {
  const [selectedModId, setSelectedModId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const modificationId = event.currentTarget.value;
    setSelectedModId("");
    if (!modificationId) {
      return;
    }

    setIsAssigning(true);
    setErrorMessage(null);
    try {
      const result = await assignModificationToPhase(
        vehicleId,
        modificationId,
        phaseId,
      );
      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }
      router.refresh();
    } catch (error) {
      console.error("Modification assignment request failed.", error);
      setErrorMessage("Could not assign this modification. Please try again.");
    } finally {
      setIsAssigning(false);
    }
  }

  return (
    <div className="build-timeline__assign">
      <label>
        <span className="sr-only">Assign an existing modification to this phase</span>
        <select
          value={selectedModId}
          onChange={handleChange}
          disabled={isAssigning || availableMods.length === 0}
          aria-label="Assign an existing modification to this phase"
        >
          <option value="">
            {isAssigning
              ? "Assigning..."
              : availableMods.length > 0
                ? "+ Assign existing mod"
                : "All mods assigned"}
          </option>
          {availableMods.map((mod) => (
            <option key={mod.id} value={mod.id}>
              {mod.part_name} · {mod.status}
            </option>
          ))}
        </select>
      </label>
      {errorMessage && (
        <p role="alert" className="build-timeline__error">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
