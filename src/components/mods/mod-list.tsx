"use client";

import { useState } from "react";
import { MOD_CATEGORIES, MOD_STATUSES, type Mod } from "@/types/database";
import { ModCard } from "@/components/mods/mod-card";

interface ModListProps {
  mods: Mod[];
}

export function ModList({ mods }: ModListProps) {
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const filteredMods = mods.filter(
    (mod) =>
      (!categoryFilter || mod.category === categoryFilter) &&
      (!statusFilter || mod.status === statusFilter),
  );

  return (
    <section aria-labelledby="mod-list-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="mod-list-heading" className="text-xl font-semibold text-white">
            Your modifications
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            {mods.length} {mods.length === 1 ? "part" : "parts"} in this build
          </p>
        </div>
        {mods.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium text-zinc-400">
              Filter by category
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.currentTarget.value)}
                className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-[#131819] px-3 text-sm text-white outline-none focus:border-lime-400"
              >
                <option value="">All categories</option>
                {MOD_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-zinc-400">
              Filter by status
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.currentTarget.value)}
                className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-[#131819] px-3 text-sm text-white outline-none focus:border-lime-400"
              >
                <option value="">All statuses</option>
                {MOD_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </div>
      {filteredMods.length > 0 ? (
        <div className="mt-5 grid gap-4">
          {filteredMods.map((mod) => (
            <ModCard key={mod.id} mod={mod} />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-10 text-center">
          <h3 className="font-semibold text-white">
            {mods.length === 0 ? "Your build is ready" : "No matching modifications"}
          </h3>
          <p className="mt-2 text-sm text-zinc-400">
            {mods.length === 0
              ? "Add a part above to start tracking this vehicle's build."
              : "Try changing or clearing the selected filters."}
          </p>
        </div>
      )}
    </section>
  );
}
