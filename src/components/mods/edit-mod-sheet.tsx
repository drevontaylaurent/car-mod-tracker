"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateMod } from "@/actions/mods";
import { SheetDialog } from "@/components/ui/sheet-dialog";
import { MOD_CATEGORY_GROUPS } from "@/lib/mod-categories";
import { PURCHASE_URL_MAX_LENGTH } from "@/lib/purchase-url";
import {
  MOD_STATUSES,
  SELECTABLE_MOD_CATEGORIES,
  type Mod,
} from "@/types/database";

interface EditModSheetProps {
  mod: Mod;
  onClose: () => void;
}

export function EditModSheet({ mod, onClose }: EditModSheetProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateMod, undefined);
  const isLegacyCategory = !SELECTABLE_MOD_CATEGORIES.some(
    (category) => category === mod.category,
  );

  useEffect(() => {
    if (state?.success) {
      router.refresh();
      onClose();
    }
  }, [onClose, router, state]);

  return (
    <SheetDialog eyebrow="Mod Inventory" title="Edit Modification" onClose={onClose}>
      <form action={formAction} className="add-mod__form edit-sheet__form">
        <input type="hidden" name="modId" value={mod.id} />
        <label className="field-label add-mod__label add-mod__wide">
          Part name *
          <input
            required
            maxLength={150}
            name="part_name"
            defaultValue={mod.part_name}
            className="field-control mt-2"
          />
        </label>
        <label className="field-label add-mod__label">
          Brand
          <input
            maxLength={100}
            name="brand"
            defaultValue={mod.brand ?? ""}
            className="field-control mt-2"
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
            defaultValue={mod.cost}
            className="field-control mt-2"
          />
        </label>
        <label className="field-label add-mod__label">
          System
          <select name="category" defaultValue={mod.category} className="field-control mt-2">
            {isLegacyCategory && <option value={mod.category}>{mod.category}</option>}
            {MOD_CATEGORY_GROUPS.map((group) => (
              <option key={group.id} value={group.selectValue}>
                {group.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field-label add-mod__label">
          Status
          <select name="status" defaultValue={mod.status} className="field-control mt-2">
            {MOD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="field-label add-mod__label add-mod__wide">
          Install date (optional)
          <input
            type="date"
            name="install_date"
            defaultValue={mod.install_date ?? ""}
            className="field-control add-mod__date mt-2"
          />
        </label>
        <label className="field-label add-mod__label add-mod__wide">
          Purchase URL (optional)
          <input
            type="url"
            inputMode="url"
            name="purchase_url"
            defaultValue={mod.purchase_url ?? ""}
            maxLength={PURCHASE_URL_MAX_LENGTH}
            className="field-control mt-2"
            placeholder="https://"
          />
          <span className="add-mod__note">
            Link to the part or product page. Leave blank to remove it.
          </span>
        </label>
        <label className="field-label add-mod__label add-mod__wide">
          Notes (optional)
          <textarea
            name="notes"
            rows={3}
            maxLength={2000}
            defaultValue={mod.notes ?? ""}
            className="field-control mt-2"
          />
        </label>
        {state && !state.success && (
          <p role="alert" className="state-message add-mod__wide" data-tone="error">
            {state.error}
          </p>
        )}
        <div className="add-mod__actions add-mod__wide">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="button-secondary"
          >
            Cancel
          </button>
          <button type="submit" disabled={isPending} className="button-primary">
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </SheetDialog>
  );
}
