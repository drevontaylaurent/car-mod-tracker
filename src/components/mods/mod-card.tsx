"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteMod, updateModStatus } from "@/actions/mods";
import { MOD_STATUSES, type Mod } from "@/types/database";
import { getSafePurchaseUrl } from "@/lib/purchase-url";
import { ModPurchaseLinkEditor } from "./mod-purchase-link-editor";

interface ModCardProps {
  mod: Mod;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function ModCard({ mod }: ModCardProps) {
  const router = useRouter();
  const [status, setStatus] = useState(mod.status);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [purchaseUrl, setPurchaseUrl] = useState(mod.purchase_url);
  const [isLinkEditorOpen, setIsLinkEditorOpen] = useState(false);
  const safePurchaseUrl = getSafePurchaseUrl(purchaseUrl);

  async function handleStatusChange(value: string) {
    const nextStatus = MOD_STATUSES.find((candidate) => candidate === value);
    if (!nextStatus || nextStatus === status) return;

    setStatus(nextStatus);
    setIsPending(true);
    setErrorMessage(null);
    try {
      const result = await updateModStatus(mod.id, nextStatus);
      if (!result.success) {
        setStatus(mod.status);
        setErrorMessage(result.error);
        return;
      }
      setStatus(result.data.status);
      router.refresh();
    } catch {
      setStatus(mod.status);
      setErrorMessage("Could not update this status. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${mod.part_name}" from this build?`)) return;

    setIsPending(true);
    setErrorMessage(null);
    try {
      const result = await deleteMod(mod.id);
      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }
      router.refresh();
    } catch {
      setErrorMessage("Could not delete this modification. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <article className="open-build__mod-row" data-status={status}>
      <div className="open-build__category-marker" aria-hidden="true">
        {mod.category.split(" ")[0].toUpperCase()}
      </div>
      <h3 className="open-build__part-name" title={mod.part_name}>
        {mod.part_name}
      </h3>
      <div className="open-build__part-price">
        <p className="open-build__part-cost">
          {currencyFormatter.format(mod.cost)}
        </p>
        <button
          type="button"
          onClick={() => setIsLinkEditorOpen((isOpen) => !isOpen)}
          disabled={isPending}
          aria-expanded={isLinkEditorOpen}
          aria-label={`${purchaseUrl ? "Edit" : "Add"} purchase link for ${mod.part_name}`}
          className="open-build__icon-button"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="open-build__icon">
            <path
              d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => void handleDelete()}
          disabled={isPending}
          aria-label={`Delete ${mod.part_name}`}
          className="open-build__icon-button open-build__delete"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="open-build__icon">
            <path
              d="M4 7h16M9 7V4.5h6V7m-8 0 1 13h8l1-13M10 11v6m4-6v6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <p className="open-build__part-metadata">
        {mod.brand && <span className="open-build__part-brand">{mod.brand}</span>}
        <span className="open-build__part-tag">{mod.category}</span>
      </p>
      <div className="open-build__part-controls">
        {safePurchaseUrl && (
          <a
            href={safePurchaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Buy ${mod.part_name} (opens in a new tab)`}
            className="open-build__buy"
          >
            Buy
          </a>
        )}
        <label className="open-build__status-select-label">
          <span className="sr-only">Update status for {mod.part_name}</span>
          <select
            value={status}
            disabled={isPending}
            onChange={(event) => void handleStatusChange(event.currentTarget.value)}
            className="open-build__status-select"
          >
            {MOD_STATUSES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="open-build__part-extra">
        {mod.install_date && (
          <p className="open-build__part-date">
            <span className="technical-label">Install date / </span>
            <time dateTime={mod.install_date}>{mod.install_date}</time>
          </p>
        )}
        {mod.notes && (
          <p className="open-build__part-notes">{mod.notes}</p>
        )}
        <ModPurchaseLinkEditor
          mod={{ ...mod, purchase_url: purchaseUrl }}
          disabled={isPending}
          isOpen={isLinkEditorOpen}
          onClose={() => setIsLinkEditorOpen(false)}
          onSaved={setPurchaseUrl}
        />
      </div>
      {errorMessage && (
        <p role="alert" className="state-message open-build__mod-error" data-tone="error">
          {errorMessage}
        </p>
      )}
    </article>
  );
}
