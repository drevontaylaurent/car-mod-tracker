"use client";

import { useState } from "react";
import {
  type Mod,
  type ModCategory,
  type ModStatus,
} from "@/types/database";
import { ModCard } from "@/components/mods/mod-card";

type CategoryGroupId = "power" | "interior" | "exterior" | "maintenance";

interface CategoryGroup {
  id: CategoryGroupId;
  label: string;
  categories: readonly ModCategory[];
}

const categoryGroups: readonly CategoryGroup[] = [
  {
    id: "power",
    label: "POWER MODS",
    categories: ["Engine", "Suspension", "Exhaust", "Wheels/Tires", "Electronics"],
  },
  { id: "interior", label: "INTERIOR", categories: ["Interior"] },
  { id: "exterior", label: "EXTERIOR", categories: ["Exterior"] },
  { id: "maintenance", label: "MAINTENANCE PARTS", categories: [] },
];

interface ModListProps {
  mods: Mod[];
  statusFilter: ModStatus | null;
}

export function ModList({ mods, statusFilter }: ModListProps) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryGroupId | "all">(
    "all",
  );
  const statusFilteredMods = mods.filter(
    (mod) => !statusFilter || mod.status === statusFilter,
  );
  const selectedGroup = categoryGroups.find(
    (group) => group.id === categoryFilter,
  );
  const filteredMods = statusFilteredMods.filter(
    (mod) => !selectedGroup || selectedGroup.categories.includes(mod.category),
  );
  const categoryGroupCounts = new Map<CategoryGroupId, number>();
  for (const group of categoryGroups) {
    categoryGroupCounts.set(
      group.id,
      statusFilteredMods.filter((mod) => group.categories.includes(mod.category))
        .length,
    );
  }

  return (
    <section className="open-build__mod-list" aria-labelledby="mod-list-heading">
      <div className="open-build__mod-list-heading">
        <div>
          <h2 id="mod-list-heading" className="open-build__mod-list-title">
            Mod Inventory
          </h2>
          <p className="open-build__mod-count" aria-live="polite">
            {filteredMods.length} of {mods.length} parts shown
          </p>
        </div>
      </div>

      <div className="open-build__category-strip" role="group" aria-label="Filter modifications by category">
        <button
          type="button"
          aria-pressed={categoryFilter === "all"}
          aria-label={`All categories: ${statusFilteredMods.length}`}
          onClick={() => setCategoryFilter("all")}
          className="open-build__category-filter"
        >
          <span>ALL</span>
          <span className="open-build__category-count">{statusFilteredMods.length}</span>
        </button>
        {categoryGroups.map((group) => (
          <button
            key={group.id}
            type="button"
            aria-pressed={categoryFilter === group.id}
            aria-label={`${group.label}: ${categoryGroupCounts.get(group.id) ?? 0}`}
            onClick={() => setCategoryFilter(group.id)}
            className="open-build__category-filter"
          >
            <span>{group.label}</span>
            <span className="open-build__category-count">
              {categoryGroupCounts.get(group.id) ?? 0}
            </span>
          </button>
        ))}
      </div>

      {filteredMods.length > 0 ? (
        <div className="open-build__mod-rows">
          {filteredMods.map((mod) => <ModCard key={mod.id} mod={mod} />)}
        </div>
      ) : (
        <div className="open-build__empty-state">
          <h3>
            {mods.length === 0 ? "No modifications tracked" : "No matching modifications"}
          </h3>
          <p>
            {mods.length === 0
              ? "Use + ADD MOD to start tracking this build."
              : "Try another status or category filter."}
          </p>
        </div>
      )}
    </section>
  );
}
