"use client";

import { useActionState } from "react";
import { createMod } from "@/actions/mods";
import { MOD_CATEGORIES, MOD_STATUSES } from "@/types/database";

interface AddModFormProps {
  vehicleId: string;
}

const inputClassName =
  "mt-2 h-11 w-full rounded-lg border border-white/10 bg-[#0b0e0f] px-3 text-sm text-white outline-none transition focus:border-lime-400";

export function AddModForm({ vehicleId }: AddModFormProps) {
  const [state, formAction, isPending] = useActionState(createMod, undefined);

  return (
    <section className="rounded-2xl border border-white/10 bg-[#131819] p-5 sm:p-6">
      <h2 className="text-xl font-semibold text-white">Add a modification</h2>
      <p className="mt-1 text-sm text-zinc-400">
        Record a part for this vehicle&apos;s build.
      </p>
      <form action={formAction} className="mt-5 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="vehicleId" value={vehicleId} />
        <label className="text-sm font-medium text-zinc-300">
          Part Name
          <input
            required
            maxLength={150}
            name="part_name"
            className={inputClassName}
            placeholder="Cold air intake"
          />
        </label>
        <label className="text-sm font-medium text-zinc-300">
          Brand
          <input
            maxLength={100}
            name="brand"
            className={inputClassName}
            placeholder="Brand name"
          />
        </label>
        <label className="text-sm font-medium text-zinc-300">
          Category
          <select required name="category" defaultValue="" className={inputClassName}>
            <option value="" disabled>
              Select a category
            </option>
            {MOD_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-zinc-300">
          Status
          <select
            required
            name="status"
            defaultValue="Wishlist"
            className={inputClassName}
          >
            {MOD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-zinc-300">
          Cost
          <input
            required
            min="0"
            step="0.01"
            type="number"
            name="cost"
            className={inputClassName}
            placeholder="0.00"
          />
        </label>
        <label className="text-sm font-medium text-zinc-300">
          Install Date
          <input type="date" name="install_date" className={inputClassName} />
        </label>
        <label className="text-sm font-medium text-zinc-300 sm:col-span-2">
          Notes
          <textarea
            maxLength={2000}
            name="notes"
            rows={3}
            className="mt-2 w-full rounded-lg border border-white/10 bg-[#0b0e0f] px-3 py-2 text-sm text-white outline-none transition focus:border-lime-400"
            placeholder="Installation details, links, or reminders"
          />
        </label>
        {state && (
          <p
            role={state.success ? "status" : "alert"}
            className={`text-sm sm:col-span-2 ${
              state.success ? "text-lime-300" : "text-red-300"
            }`}
          >
            {state.success ? "Modification added to this build." : state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="h-11 rounded-lg bg-lime-400 px-5 text-sm font-semibold text-[#111513] transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2 sm:justify-self-start"
        >
          {isPending ? "Saving..." : "Add Modification"}
        </button>
      </form>
    </section>
  );
}
