import type { ModCategory, SelectableModCategory } from "@/types/database";

export type ModCategoryGroupId = "power" | "interior" | "exterior" | "maintenance";

export interface ModCategoryGroup {
  id: ModCategoryGroupId;
  label: string;
  /** Value persisted when the user picks this group for a new modification. */
  selectValue: SelectableModCategory;
  /** Every stored category value (including legacy ones) shown in this group. */
  categories: readonly ModCategory[];
}

export const MOD_CATEGORY_GROUPS: readonly ModCategoryGroup[] = [
  {
    id: "power",
    label: "Power Mods",
    selectValue: "Power Mods",
    categories: [
      "Power Mods",
      "Engine",
      "Suspension",
      "Exhaust",
      "Wheels/Tires",
      "Electronics",
    ],
  },
  {
    id: "interior",
    label: "Interior",
    selectValue: "Interior",
    categories: ["Interior"],
  },
  {
    id: "exterior",
    label: "Exterior",
    selectValue: "Exterior",
    categories: ["Exterior"],
  },
  {
    id: "maintenance",
    label: "Maintenance Parts",
    selectValue: "Maintenance Parts",
    categories: ["Maintenance Parts"],
  },
];

export function getModCategoryGroup(
  category: ModCategory,
): ModCategoryGroup | undefined {
  return MOD_CATEGORY_GROUPS.find((group) =>
    group.categories.includes(category),
  );
}
