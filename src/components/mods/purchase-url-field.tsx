"use client";

import { PURCHASE_URL_MAX_LENGTH } from "@/lib/purchase-url";
import type { AutofillStatus } from "./use-add-mod-fields";

interface PurchaseUrlFieldProps {
  value: string;
  onChange: (value: string) => void;
  mode: "url" | "manual";
  autofill: AutofillStatus;
  onAutofill: () => void;
}

export function PurchaseUrlField({
  value,
  onChange,
  mode,
  autofill,
  onAutofill,
}: PurchaseUrlFieldProps) {
  const isUrlMode = mode === "url";

  return (
    <div className="add-mod__wide">
      <label htmlFor="add-mod-purchase-url" className="field-label add-mod__label">
        {isUrlMode ? "Product URL" : "Purchase / Product URL (optional)"}
      </label>
      <div className={isUrlMode ? "add-mod__url-row" : undefined}>
        <input
          id="add-mod-purchase-url"
          type="url"
          inputMode="url"
          name="purchase_url"
          value={value}
          maxLength={PURCHASE_URL_MAX_LENGTH}
          onChange={(event) => onChange(event.currentTarget.value)}
          className="field-control mt-2"
          placeholder="https://"
        />
        {isUrlMode && (
          <button
            type="button"
            onClick={onAutofill}
            disabled={autofill.isLoading || value.trim().length === 0}
            className="button-secondary add-mod__autofill"
          >
            {autofill.isLoading ? "Reading..." : "Auto-Fill"}
          </button>
        )}
      </div>
      {isUrlMode ? (
        <p
          role={autofill.tone === "error" ? "alert" : "status"}
          className="add-mod__note"
          data-tone={autofill.tone}
        >
          {autofill.message ??
            "Paste a product link to fill in what can be found. You can edit everything before adding."}
        </p>
      ) : (
        <p className="add-mod__note">Link to the part or product page.</p>
      )}
    </div>
  );
}
