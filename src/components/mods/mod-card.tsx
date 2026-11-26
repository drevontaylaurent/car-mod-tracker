"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteMod, updateModStatus } from "@/actions/mods";
import { MOD_STATUSES, type Mod } from "@/types/database";

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
    <article className="open-build__mod-row" data-status={status}>
      <div className="open-build__mod-main">
        <div className="open-build__category-marker" aria-hidden="true">
          {mod.category.slice(0, 3).toUpperCase()}
        </div>
        <div className="open-build__mod-details">
          <h3 className="open-build__part-name">{mod.part_name}</h3>
          <p className="open-build__part-metadata">
            {[mod.brand, mod.category].filter(Boolean).join(" · ")}
          </p>
          {mod.install_date && (
            <p className="open-build__part-date">
              <span className="technical-label">Install date / </span>
              <time dateTime={mod.install_date}>{mod.install_date}</time>
            </p>
          )}
          {mod.notes && (
            <p className="open-build__part-notes">{mod.notes}</p>
          )}
        </div>
      </div>
      <div className="open-build__mod-actions">
        <p className="open-build__part-cost">
          {currencyFormatter.format(mod.cost)}
        </p>
        <label className="open-build__status-select-label">
          <span className="sr-only">Update status for {mod.part_name}</span>
          <select
            value={status}
            disabled={isPending}
            onChange={(event) => void handleStatusChange(event.currentTarget.value)}
            className="open-build__status-select"
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
          className="button-ghost open-build__delete"
        >
          {isPending ? "Saving..." : "Delete"}
        </button>
      </div>
      {errorMessage && (
        <p role="alert" className="state-message open-build__mod-error" data-tone="error">
          {errorMessage}
        </p>
      )}
    </article>
  );
}
