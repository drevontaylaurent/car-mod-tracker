"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteMod, updateModStatus } from "@/actions/mods";
import { MOD_STATUSES, type Mod } from "@/types/database";
import { StatusBadge } from "@/components/ui/status-badge";

interface ModCardProps {
  mod: Mod;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function ModCard({ mod }: ModCardProps) {
  const router = useRouter();
  const [status, setStatus] = useState(mod.status);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleStatusChange(value: string) {
    const nextStatus = MOD_STATUSES.find((candidate) => candidate === value);
    if (!nextStatus || nextStatus === status) return;

    setStatus(nextStatus);
    setIsPending(true);
    setErrorMessage(null);
    try {
      const result = await updateModStatus(mod.id, nextStatus);
      if (!result.success) {
        setStatus(mod.status);
        setErrorMessage(result.error);
        return;
      }
      setStatus(result.data.status);
      router.refresh();
    } catch {
      setStatus(mod.status);
      setErrorMessage("Could not update this status. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${mod.part_name}" from this build?`)) return;

    setIsPending(true);
    setErrorMessage(null);
    try {
      const result = await deleteMod(mod.id);
      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }
      router.refresh();
    } catch {
      setErrorMessage("Could not delete this modification. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <article className="build-mod-entry">
      <div className="build-mod-entry__top">
        <div className="min-w-0">
          <div className="build-mod-entry__identity">
            <h4 className="build-mod-entry__name">{mod.part_name}</h4>
            <StatusBadge status={status} />
          </div>
          <p className="build-mod-entry__metadata">
            {[mod.brand, mod.category].filter(Boolean).join(" · ")}
          </p>
        </div>
        <p className="build-mod-entry__cost">
          {currencyFormatter.format(mod.cost)}
        </p>
      </div>
      {mod.install_date && (
        <p className="build-mod-entry__date">
          <span className="technical-label">Install date / </span>
          <time dateTime={mod.install_date}>{mod.install_date}</time>
        </p>
      )}
      {mod.notes && (
        <p className="build-mod-entry__notes">
          {mod.notes}
        </p>
      )}
      <div className="build-mod-entry__controls">
        <label className="build-mod-entry__status">
          <span className="technical-label">Update status</span>
          <select
            aria-label={`Change status for ${mod.part_name}`}
            value={status}
            disabled={isPending}
            onChange={(event) => void handleStatusChange(event.currentTarget.value)}
            className="field-control"
          >
            {MOD_STATUSES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => void handleDelete()}
          disabled={isPending}
          className="button-ghost build-mod-entry__delete"
        >
          {isPending ? "Saving..." : "Delete"}
        </button>
      </div>
      {errorMessage && (
        <p role="alert" className="state-message mt-3" data-tone="error">
          {errorMessage}
        </p>
      )}
    </article>
  );
}
