"use client";

import { PURCHASE_URL_MAX_LENGTH } from "@/lib/purchase-url";

interface PurchaseUrlFieldProps {
  value: string;
  onChange: (value: string) => void;
  mode: "url" | "manual";
}

export function PurchaseUrlField({ value, onChange, mode }: PurchaseUrlFieldProps) {
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
            disabled
            aria-describedby="add-mod-autofill-note"
            className="button-secondary add-mod__autofill"
          >
            Auto-Fill
          </button>
        )}
      </div>
      {isUrlMode ? (
        <p id="add-mod-autofill-note" className="add-mod__note">
          Auto-fill is not available yet. Enter the part details below — this link
          is saved as the purchase link for the BUY button.
        </p>
      ) : (
        <p className="add-mod__note">Link to the part or product page.</p>
      )}
    </div>
  );
}
