"use client";

import { useState } from "react";
import { CreateDiagnosticForm } from "@/components/diagnostics/create-diagnostic-form";

interface DiagnosticTrackerHeaderProps {
  vehicleId: string;
  canAdd: boolean;
}

export function DiagnosticTrackerHeader({
  vehicleId,
  canAdd,
}: DiagnosticTrackerHeaderProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <header className="open-build__diagnostic-heading">
        <span className="open-build__diagnostic-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M13.5 2 5 13.5h5.5L9.5 22 19 9.5h-5.8z" />
          </svg>
        </span>
        <div className="open-build__diagnostic-title">
          <h2 id="diagnostic-tracker-heading">OBD-II Diagnostic Tracker</h2>
          <p>Manual records for this vehicle</p>
        </div>
        {canAdd && (
          <button
            type="button"
            className="open-build__diagnostic-add"
            aria-expanded={isFormOpen}
            aria-controls="diagnostic-create-form"
            onClick={() => setIsFormOpen((open) => !open)}
          >
            {isFormOpen ? "Close" : "+ Code"}
          </button>
        )}
      </header>
      {canAdd && isFormOpen && (
        <div id="diagnostic-create-form">
          <CreateDiagnosticForm vehicleId={vehicleId} />
        </div>
      )}
    </>
  );
}
