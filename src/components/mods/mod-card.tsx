"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteMod, updateModStatus } from "@/actions/mods";
import { MOD_STATUSES, type Mod, type ModStatus } from "@/types/database";

interface ModCardProps {
  mod: Mod;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const statusClassNames: Record<ModStatus, string> = {
  Wishlist: "border-amber-300/20 bg-amber-300/10 text-amber-200",
  Ordered: "border-sky-300/20 bg-sky-300/10 text-sky-200",
  Installed: "border-lime-300/20 bg-lime-300/10 text-lime-200",
};

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
    <article className="rounded-2xl border border-white/10 bg-[#131819] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-white">{mod.part_name}</h3>
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusClassNames[status]}`}
            >
              {status}
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            {[mod.brand, mod.category].filter(Boolean).join(" · ")}
          </p>
        </div>
        <p className="text-lg font-semibold text-white">
          {currencyFormatter.format(mod.cost)}
        </p>
      </div>
      {mod.install_date && (
        <p className="mt-4 text-sm text-zinc-400">
          Install date: <time dateTime={mod.install_date}>{mod.install_date}</time>
        </p>
      )}
      {mod.notes && (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
          {mod.notes}
        </p>
      )}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
        <label className="flex items-center gap-2 text-sm text-zinc-400">
          Status
          <select
            aria-label={`Change status for ${mod.part_name}`}
            value={status}
            disabled={isPending}
            onChange={(event) => void handleStatusChange(event.currentTarget.value)}
            className="h-9 rounded-lg border border-white/10 bg-[#0b0e0f] px-2 text-sm text-white outline-none focus:border-lime-400 disabled:opacity-60"
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
          className="text-sm font-medium text-zinc-500 transition hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Delete"}
        </button>
      </div>
      {errorMessage && (
        <p role="alert" className="mt-3 text-sm text-red-300">
          {errorMessage}
        </p>
      )}
    </article>
  );
}
