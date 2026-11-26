"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateModPurchaseUrl } from "@/actions/mods";
import { PURCHASE_URL_MAX_LENGTH } from "@/lib/purchase-url";
import type { Mod } from "@/types/database";

interface ModPurchaseLinkEditorProps {
  mod: Mod;
  disabled: boolean;
  onSaved: (purchaseUrl: string | null) => void;
}

export function ModPurchaseLinkEditor({
  mod,
  disabled,
  onSaved,
}: ModPurchaseLinkEditorProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(mod.purchase_url ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const result = await updateModPurchaseUrl(mod.id, value);
      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }
      setValue(result.data.purchase_url ?? "");
      onSaved(result.data.purchase_url);
      setIsOpen(false);
      router.refresh();
    } catch {
      setErrorMessage("Could not save this link. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className="button-ghost open-build__delete"
      >
        {mod.purchase_url ? "Edit link" : "Add link"}
      </button>
    );
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="open-build__link-form">
      <label className="field-label">
        Purchase URL (optional)
        <input
          type="url"
          inputMode="url"
          value={value}
          maxLength={PURCHASE_URL_MAX_LENGTH}
          onChange={(event) => setValue(event.currentTarget.value)}
          className="field-control mt-2"
          placeholder="https://"
        />
      </label>
      <p className="text-xs text-text-secondary">Leave blank to remove the link.</p>
      {errorMessage && (
        <p role="alert" className="state-message" data-tone="error">
          {errorMessage}
        </p>
      )}
      <div className="open-build__link-form-actions">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          disabled={isSaving}
          className="button-secondary"
        >
          Cancel
        </button>
        <button type="submit" disabled={isSaving} className="button-primary">
          {isSaving ? "Saving..." : "Save link"}
        </button>
      </div>
    </form>
  );
}
