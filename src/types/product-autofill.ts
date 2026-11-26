import type { SelectableModCategory } from "./database";

export interface ProductAutofillData {
  partName: string | null;
  brand: string | null;
  price: number | null;
  category: SelectableModCategory | null;
}
