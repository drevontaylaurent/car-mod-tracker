"use client";

import { useActionState, useEffect, useRef } from "react";
import { createMod } from "@/actions/mods";
import { MOD_CATEGORIES, MOD_STATUSES } from "@/types/database";

interface AddModFormProps {
  vehicleId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export function AddModForm({ vehicleId, onCancel, onSuccess }: AddModFormProps) {
  const [state, formAction, isPending] = useActionState(createMod, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      onSuccess();
    }
  }, [onSuccess, state]);

  return (
    <section className="build-add-form" aria-labelledby="add-mod-heading">
      <p className="technical-label text-accent">Build system / 03</p>
      <h2 id="add-mod-heading" className="mt-2 text-xl font-semibold text-foreground">
        Add a modification
      </h2>
      <p className="mt-1 text-sm text-text-secondary">
        Record a part for this vehicle&apos;s build.
      </p>
      <form
        ref={formRef}
        action={formAction}
        className="build-add-form__fields"
      >
        <input type="hidden" name="vehicleId" value={vehicleId} />
        <label className="field-label">
          Part name
          <input
            required
            maxLength={150}
            name="part_name"
            className="field-control mt-2"
            placeholder="Cold air intake"
          />
        </label>
        <label className="field-label">
          Brand
          <input
            maxLength={100}
            name="brand"
            className="field-control mt-2"
            placeholder="Brand name"
          />
        </label>
        <label className="field-label">
          Category
          <select required name="category" defaultValue="" className="field-control mt-2">
            <option value="" disabled>
              Select a category
            </option>
            {MOD_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label className="field-label">
          Status
          <select
            required
            name="status"
            defaultValue="Wishlist"
            className="field-control mt-2"
          >
            {MOD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="field-label">
          Cost
          <input
            required
            min="0"
            step="0.01"
            type="number"
            name="cost"
            className="field-control mt-2"
            placeholder="0.00"
          />
        </label>
        <label className="field-label">
          Install date
          <input type="date" name="install_date" className="field-control mt-2" />
        </label>
        <label className="field-label build-add-form__notes">
          Notes
          <textarea
            maxLength={2000}
            name="notes"
            rows={3}
            className="field-control mt-2"
            placeholder="Installation details, links, or reminders"
          />
        </label>
        {state && (
          <p
            role={state.success ? "status" : "alert"}
            className="state-message build-add-form__message"
            data-tone={state.success ? "success" : "error"}
          >
            {state.success ? "Modification added to this build." : state.error}
          </p>
        )}
        <div className="build-add-form__actions">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="button-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="button-primary build-add-form__submit"
          >
            {isPending ? "Saving..." : "Add Modification"}
          </button>
        </div>
      </form>
    </section>
  );
}
