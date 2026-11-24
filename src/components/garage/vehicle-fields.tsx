"use client";

import { VehicleDetailFields } from "@/components/garage/vehicle-detail-fields";

export type VehicleEntryMode = "vin" | "manual";

interface VehicleFieldsProps {
  mode: VehicleEntryMode;
  showVehicleDetails: boolean;
  vin: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  nickname: string;
  decodeError: string;
  decodeMessage: string;
  isDecoding: boolean;
  onVinChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onMakeChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onTrimChange: (value: string) => void;
  onNicknameChange: (value: string) => void;
  onDecode: () => void;
}

export function VehicleFields({
  mode,
  showVehicleDetails,
  vin,
  year,
  make,
  model,
  trim,
  nickname,
  decodeError,
  decodeMessage,
  isDecoding,
  onVinChange,
  onYearChange,
  onMakeChange,
  onModelChange,
  onTrimChange,
  onNicknameChange,
  onDecode,
}: VehicleFieldsProps) {
  const currentYear = new Date().getFullYear();
  const shouldShowVehicleDetails =
    mode === "manual" || showVehicleDetails;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="vehicle-vin" className="field-label">
          {mode === "manual" ? "VIN (Optional)" : "VIN"}
        </label>
        <input
          id="vehicle-vin"
          name="vin"
          type="text"
          required={mode === "vin"}
          minLength={17}
          maxLength={17}
          pattern="[A-HJ-NPR-Za-hj-npr-z0-9]{17}"
          title="Enter all 17 VIN characters, excluding I, O, and Q."
          autoCapitalize="characters"
          autoComplete="off"
          placeholder="17-character vehicle identification number"
          value={vin}
          onChange={(event) => onVinChange(event.target.value)}
          className="field-control uppercase placeholder:normal-case"
        />
        {mode === "manual" && (
          <p className="mt-2 text-sm text-zinc-400">
            Don&apos;t know your VIN? You can add it later.
          </p>
        )}
        {mode === "vin" && (
          <>
            <button
              type="button"
              onClick={onDecode}
              disabled={isDecoding || vin.length !== 17}
              className="button-secondary mt-2"
            >
              {isDecoding ? "Decoding VIN..." : "Decode VIN"}
            </button>
            {decodeError && (
              <p role="alert" className="state-message mt-2" data-tone="error">
                {decodeError}
              </p>
            )}
            {decodeMessage && (
              <p role="status" className="state-message mt-2" data-tone="success">
                {decodeMessage}
              </p>
            )}
          </>
        )}
      </div>
      {shouldShowVehicleDetails && (
        <VehicleDetailFields
          year={year}
          make={make}
          model={model}
          trim={trim}
          nickname={nickname}
          currentYear={currentYear}
          onYearChange={onYearChange}
          onMakeChange={onMakeChange}
          onModelChange={onModelChange}
          onTrimChange={onTrimChange}
          onNicknameChange={onNicknameChange}
        />
      )}
    </div>
  );
}
