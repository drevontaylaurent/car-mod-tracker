"use client";

import { AddModForm } from "@/components/mods/add-mod-form";

interface AddModDialogProps {
  vehicleId: string;
  onClose: () => void;
}

export function AddModDialog({ vehicleId, onClose }: AddModDialogProps) {
  return (
    <div className="add-mod__backdrop">
      <section
        id="add-mod-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-mod-heading"
        className="add-mod__sheet"
      >
        <header className="add-mod__header">
          <div>
            <p className="technical-label text-accent">Vehicle / Actions</p>
            <h2 id="add-mod-heading" className="add-mod__title">
              Add Modification to Build
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Add Modification form"
            className="add-mod__close"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>
        <AddModForm vehicleId={vehicleId} onCancel={onClose} onSuccess={onClose} />
      </section>
    </div>
  );
}
