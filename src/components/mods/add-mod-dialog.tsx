"use client";

import { AddModForm } from "@/components/mods/add-mod-form";

interface AddModDialogProps {
  vehicleId: string;
  onClose: () => void;
}

export function AddModDialog({ vehicleId, onClose }: AddModDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <section
        id="add-mod-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-mod-heading"
        className="surface-primary max-h-[90vh] w-full max-w-3xl overflow-y-auto p-4 sm:p-6"
      >
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Add Modification form"
            className="button-ghost h-11 w-11 p-0 text-lg"
          >
            ×
          </button>
        </div>
        <AddModForm vehicleId={vehicleId} onCancel={onClose} />
      </section>
    </div>
  );
}
