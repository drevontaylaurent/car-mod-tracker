"use client";

import { useActionState, useState, useTransition } from "react";
import { createVehicle, lookupVinAction } from "@/actions/vehicles";
import { VehicleFields } from "@/components/garage/vehicle-fields";

interface AddVehicleModalProps {
  onClose: () => void;
}

export function AddVehicleModal({ onClose }: AddVehicleModalProps) {
  const [state, formAction, isPending] = useActionState(createVehicle, undefined);
  const [vin, setVin] = useState("");
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [trim, setTrim] = useState("");
  const [nickname, setNickname] = useState("");
  const [decodeError, setDecodeError] = useState("");
  const [decodeMessage, setDecodeMessage] = useState("");
  const [isDecoding, startDecode] = useTransition();

  function handleDecodeVin() {
    setDecodeError("");
    setDecodeMessage("");
    startDecode(async () => {
      const result = await lookupVinAction(vin);
      if (!result.success) {
        setDecodeError(result.error);
        return;
      }

      setYear(result.data.year?.toString() ?? "");
      setMake(result.data.make ?? "");
      setModel(result.data.model ?? "");
      setTrim(result.data.trim ?? "");
      setDecodeMessage("Decoded vehicle details. Review and edit before saving.");
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-vehicle-heading"
        className="surface-primary max-h-[90vh] w-full max-w-2xl overflow-y-auto p-5 sm:p-7"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2
              id="add-vehicle-heading"
              className="text-xl font-semibold text-white"
            >
              Add a vehicle
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Enter a VIN and any details you already know.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add vehicle dialog"
            className="button-ghost h-11 w-11 shrink-0 p-0 text-lg"
          >
            ×
          </button>
        </div>

        <form action={formAction}>
          <VehicleFields
            vin={vin}
            year={year}
            make={make}
            model={model}
            trim={trim}
            nickname={nickname}
            decodeError={decodeError}
            decodeMessage={decodeMessage}
            isDecoding={isDecoding}
            onVinChange={(value) => {
              setVin(value);
              setDecodeError("");
              setDecodeMessage("");
            }}
            onYearChange={setYear}
            onMakeChange={setMake}
            onModelChange={setModel}
            onTrimChange={setTrim}
            onNicknameChange={setNickname}
            onDecode={handleDecodeVin}
          />

          {state && !state.success && (
            <p role="alert" className="state-message mt-4" data-tone="error">
              {state.error}
            </p>
          )}
          {state?.success && (
            <p role="status" className="state-message mt-4" data-tone="success">
              Vehicle added to your garage.
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="button-secondary"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="button-primary"
            >
              {isPending ? "Adding vehicle..." : "Save vehicle"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
