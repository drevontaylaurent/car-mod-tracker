"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { unassignModificationFromPhase } from "@/actions/build-timeline";
import type { BuildPhase } from "@/types/build-timeline";
import type { Mod } from "@/types/database";

interface PhaseModificationItemProps {
  vehicleId: string;
  phase: BuildPhase;
  mod: Mod;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function PhaseModificationItem({
  vehicleId,
  phase,
  mod,
}: PhaseModificationItemProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleRemove() {
    setIsRemoving(true);
    setErrorMessage(null);
    try {
      const result = await unassignModificationFromPhase(
        vehicleId,
        mod.id,
        phase.id,
      );
      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }
      router.refresh();
    } catch (error) {
      console.error("Modification unassignment request failed.", error);
      setErrorMessage("Could not unassign this modification. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <li className="build-timeline__mod">
      <span className="build-timeline__mod-marker" aria-hidden="true">
        {mod.category.slice(0, 3).toUpperCase()}
      </span>
      <div className="build-timeline__mod-info">
        <strong>{mod.part_name}</strong>
        <span>
          {mod.status} <span aria-hidden="true">·</span>{" "}
          {currencyFormatter.format(mod.cost)}
        </span>
      </div>
      <button
        type="button"
        className="build-timeline__unassign"
        onClick={() => void handleRemove()}
        disabled={isRemoving}
        aria-label={`Unassign ${mod.part_name} from ${phase.name}`}
      >
        {isRemoving ? "..." : "UNASSIGN"}
      </button>
      {errorMessage && (
        <p role="alert" className="build-timeline__error">
          {errorMessage}
        </p>
      )}
    </li>
  );
}
