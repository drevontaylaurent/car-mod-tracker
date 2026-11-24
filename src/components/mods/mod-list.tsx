"use client";

import { useState } from "react";
import {
  MOD_CATEGORIES,
  MOD_STATUSES,
  type Mod,
  type ModCategory,
} from "@/types/database";
import { ModCard } from "@/components/mods/mod-card";

interface ModListProps {
  mods: Mod[];
  onCategoryChange?: (category: ModCategory | null) => void;
}

export function ModList({ mods, onCategoryChange }: ModListProps) {
  const [categoryFilter, setCategoryFilter] = useState<ModCategory | "">("");
  const [statusFilter, setStatusFilter] = useState("");
  const filteredMods = mods.filter(
    (mod) =>
      (!categoryFilter || mod.category === categoryFilter) &&
      (!statusFilter || mod.status === statusFilter),
  );

  function selectCategory(category: ModCategory | null) {
    setCategoryFilter(category ?? "");
    onCategoryChange?.(category);
  }

  return (
    <section className="build-mod-list" aria-labelledby="mod-list-heading">
      <div className="build-mod-list__heading">
        <div>
          <h2 id="mod-list-heading" className="build-mod-list__title">
            Tracked parts
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {mods.length} {mods.length === 1 ? "part" : "parts"} in this build
          </p>
        </div>
      </div>

      {mods.length > 0 && (
        <div className="build-mod-filters">
          <div>
            <p id="build-category-label" className="technical-label">
              Navigate systems
            </p>
            <div
              role="group"
              aria-labelledby="build-category-label"
              className="build-category-nav"
            >
              <button
                type="button"
                aria-pressed={categoryFilter === ""}
                onClick={() => selectCategory(null)}
                className="build-category-nav__item"
              >
                All systems
              </button>
              {MOD_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={categoryFilter === category}
                  onClick={() => selectCategory(category)}
                  className="build-category-nav__item"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <label className="build-status-filter">
            <span className="technical-label">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.currentTarget.value)}
              className="field-control mt-2"
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

      {filteredMods.length > 0 ? (
        <div className="build-mod-list__entries">
          {filteredMods.map((mod) => <ModCard key={mod.id} mod={mod} />)}
        </div>
      ) : (
        <div className="build-empty-state">
          <h3 className="font-semibold text-white">
            {mods.length === 0 ? "Your build is ready" : "No matching modifications"}
          </h3>
          <p className="mt-2 text-sm text-text-secondary">
            {mods.length === 0
              ? "Use the add-modification form below to start tracking this build."
              : "Try changing or clearing the selected filters."}
          </p>
        </div>
      )}
    </section>
  );
}
