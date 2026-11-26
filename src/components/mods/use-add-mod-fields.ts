"use client";

import { useRef, useState } from "react";
import { fetchProductAutofill } from "@/actions/product-autofill";

export type AddModFieldName = "partName" | "brand" | "cost" | "category";

export interface AddModFieldValues {
  partName: string;
  brand: string;
  cost: string;
  category: string;
}

export interface AutofillStatus {
  isLoading: boolean;
  message: string | null;
  tone: "success" | "error" | "info";
}

const FIELD_LABELS: Record<AddModFieldName, string> = {
  partName: "Part name",
  brand: "Brand",
  cost: "Price",
  category: "System",
};

export function useAddModFields() {
  const [values, setValues] = useState<AddModFieldValues>({
    partName: "",
    brand: "",
    cost: "",
    category: "Power Mods",
  });
  const [status, setStatus] = useState<AutofillStatus>({
    isLoading: false,
    message: null,
    tone: "info",
  });
  const touchedFields = useRef(new Set<AddModFieldName>());
  const lastAutofillUrl = useRef<string | null>(null);

  function setField(field: AddModFieldName, value: string) {
    touchedFields.current.add(field);
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function runAutofill(productUrl: string) {
    const url = productUrl.trim();
    setStatus({ isLoading: true, message: null, tone: "info" });
    try {
      const result = await fetchProductAutofill(url);
      if (!result.success) {
        setStatus({ isLoading: false, message: result.error, tone: "error" });
        return;
      }

      // The first run keeps fields the user edited; repeating Auto-Fill for the same URL overwrites them.
      const overwrite = lastAutofillUrl.current === url;
      lastAutofillUrl.current = url;
      const found: Partial<Record<AddModFieldName, string>> = {};
      if (result.data.partName) found.partName = result.data.partName;
      if (result.data.brand) found.brand = result.data.brand;
      if (result.data.price !== null) found.cost = result.data.price.toFixed(2);
      if (result.data.category) found.category = result.data.category;

      const filled: string[] = [];
      const kept: string[] = [];
      const next: Partial<AddModFieldValues> = {};
      for (const field of Object.keys(found) as AddModFieldName[]) {
        if (touchedFields.current.has(field) && !overwrite) {
          kept.push(FIELD_LABELS[field]);
          continue;
        }
        next[field] = found[field];
        touchedFields.current.delete(field);
        filled.push(FIELD_LABELS[field]);
      }

      setValues((current) => ({ ...current, ...next }));
      const parts = [
        filled.length > 0 ? `Filled: ${filled.join(", ")}.` : "Nothing new to fill.",
        kept.length > 0
          ? `Kept your edits to ${kept.join(", ")} — press Auto-Fill again to replace them.`
          : "",
        "Review before adding.",
      ];
      setStatus({
        isLoading: false,
        message: parts.filter(Boolean).join(" "),
        tone: "success",
      });
    } catch {
      setStatus({
        isLoading: false,
        message: "Could not read that page. Enter the details manually.",
        tone: "error",
      });
    }
  }

  return { values, setField, status, runAutofill };
}
