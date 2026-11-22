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
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#131819] p-5 shadow-2xl shadow-black/50 sm:p-7"
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
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition hover:bg-white/5 hover:text-white"
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
            <p role="alert" className="mt-4 text-sm text-red-300">
              {state.error}
            </p>
          )}
          {state?.success && (
            <p role="status" className="mt-4 text-sm text-lime-300">
              Vehicle added to your garage.
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-lg border border-white/10 px-4 text-sm font-medium text-zinc-300 transition hover:bg-white/5"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="h-11 rounded-lg bg-lime-400 px-5 text-sm font-semibold text-[#111513] transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Adding vehicle..." : "Save vehicle"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
