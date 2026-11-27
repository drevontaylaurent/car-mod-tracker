"use client";

import { useActionState, useEffect } from "react";
import { createMod } from "@/actions/mods";
import { MOD_CATEGORY_GROUPS } from "@/lib/mod-categories";
import { PURCHASE_URL_MAX_LENGTH } from "@/lib/purchase-url";
import { MOD_STATUSES } from "@/types/database";

interface AddModFormProps {
  vehicleId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export function AddModForm({ vehicleId, onCancel, onSuccess }: AddModFormProps) {
  const [state, formAction, isPending] = useActionState(createMod, undefined);

  useEffect(() => {
    if (state?.success) {
      onSuccess();
    }
  }, [onSuccess, state]);

  return (
    <form action={formAction} className="add-mod__form">
      <input type="hidden" name="vehicleId" value={vehicleId} />
      <label className="field-label add-mod__label add-mod__wide">
        Part name *
        <input
          required
          maxLength={150}
          name="part_name"
          className="field-control mt-2"
          placeholder="e.g., Cold Air Intake System"
        />
      </label>
      <label className="field-label add-mod__label">
        Brand
        <input
          maxLength={100}
          name="brand"
          className="field-control mt-2"
          placeholder="e.g., K-Tuned"
        />
      </label>
      <label className="field-label add-mod__label">
        Price (USD) *
        <input
          required
          min="0"
          step="0.01"
          type="number"
          inputMode="decimal"
          name="cost"
          className="field-control mt-2"
          placeholder="249.99"
        />
      </label>
      <label className="field-label add-mod__label">
        System
        <select name="category" defaultValue="Power Mods" className="field-control mt-2">
          {MOD_CATEGORY_GROUPS.map((group) => (
            <option key={group.id} value={group.selectValue}>
              {group.label}
            </option>
          ))}
        </select>
      </label>
      <label className="field-label add-mod__label">
        Status
        <select name="status" defaultValue="Wishlist" className="field-control mt-2">
          {MOD_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <label className="field-label add-mod__label add-mod__wide">
        Install date (optional)
        <input type="date" name="install_date" className="field-control add-mod__date mt-2" />
      </label>
      <label className="field-label add-mod__label add-mod__wide">
        Purchase URL (optional)
        <input
          type="url"
          inputMode="url"
          name="purchase_url"
          maxLength={PURCHASE_URL_MAX_LENGTH}
          className="field-control mt-2"
          placeholder="https://"
        />
        <span className="add-mod__note">Link to the part or product page.</span>
      </label>
      <details className="add-mod__notes add-mod__wide">
        <summary className="add-mod__label">Notes (optional)</summary>
        <textarea
          maxLength={2000}
          name="notes"
          rows={3}
          aria-label="Notes"
          className="field-control mt-2"
          placeholder="Installation details or reminders"
        />
      </details>
      {state && !state.success && (
        <p role="alert" className="state-message add-mod__wide" data-tone="error">
          {state.error}
        </p>
      )}
      <div className="add-mod__actions add-mod__wide">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="button-secondary"
        >
          Cancel
        </button>
        <button type="submit" disabled={isPending} className="button-primary">
          {isPending ? "Saving..." : "+ ADD TO BUILD"}
        </button>
      </div>
    </form>
  );
}
