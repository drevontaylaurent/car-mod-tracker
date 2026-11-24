"use client";

import { useActionState } from "react";
import { createVehicle } from "@/actions/vehicles";
import { VehicleFields } from "@/components/garage/vehicle-fields";
import type { VehicleEntryMode } from "@/components/garage/vehicle-fields";

interface AddVehicleFormProps {
  mode: VehicleEntryMode;
  vin: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  nickname: string;
  showVehicleDetails: boolean;
  decodeError: string;
  decodeMessage: string;
  isDecoding: boolean;
  onBack: () => void;
  onCancel: () => void;
  onSwitchMode: (mode: VehicleEntryMode) => void;
  onVinChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onMakeChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onTrimChange: (value: string) => void;
  onNicknameChange: (value: string) => void;
  onDecode: () => void;
}

export function AddVehicleForm({
  mode,
  vin,
  year,
  make,
  model,
  trim,
  nickname,
  showVehicleDetails,
  decodeError,
  decodeMessage,
  isDecoding,
  onBack,
  onCancel,
  onSwitchMode,
  onVinChange,
  onYearChange,
  onMakeChange,
  onModelChange,
  onTrimChange,
  onNicknameChange,
  onDecode,
}: AddVehicleFormProps) {
  const [state, formAction, isPending] = useActionState(
    createVehicle,
    undefined,
  );
  const canSave = mode === "manual" || showVehicleDetails;

  return (
    <>
      <div className="add-vehicle__navigation">
        <button
          type="button"
          onClick={onBack}
          disabled={isPending}
          className="button-ghost"
        >
          <span aria-hidden="true">←</span> Back to methods
        </button>
        <button
          type="button"
          onClick={() => onSwitchMode(mode === "vin" ? "manual" : "vin")}
          disabled={isPending}
          className="button-ghost"
        >
          {mode === "vin" ? "Enter manually" : "Switch to VIN"}
        </button>
      </div>

      <form action={formAction} className="mt-5">
        <input type="hidden" name="entryMode" value={mode} />
        <VehicleFields
          mode={mode}
          showVehicleDetails={showVehicleDetails}
          vin={vin}
          year={year}
          make={make}
          model={model}
          trim={trim}
          nickname={nickname}
          decodeError={decodeError}
          decodeMessage={decodeMessage}
          isDecoding={isDecoding}
          onVinChange={onVinChange}
          onYearChange={onYearChange}
          onMakeChange={onMakeChange}
          onModelChange={onModelChange}
          onTrimChange={onTrimChange}
          onNicknameChange={onNicknameChange}
          onDecode={onDecode}
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
          <button type="button" onClick={onCancel} className="button-secondary">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || !canSave}
            className="button-primary"
          >
            {isPending ? "Adding vehicle..." : "Save vehicle"}
          </button>
        </div>
      </form>
    </>
  );
}
