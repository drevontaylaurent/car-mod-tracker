"use client";

import { useEffect, useRef, useState } from "react";
import { VehicleDetailFields } from "@/components/garage/vehicle-detail-fields";
import { VinBarcodeScanner } from "@/components/garage/vin-barcode-scanner";
import { normalizeVinBarcodeResult } from "@/lib/vin-barcode";

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
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [barcodeMessage, setBarcodeMessage] = useState("");
  const vinInputRef = useRef<HTMLInputElement>(null);
  const scanButtonRef = useRef<HTMLButtonElement>(null);
  const focusVinAfterCloseRef = useRef(false);
  const focusScanButtonAfterCloseRef = useRef(false);

  useEffect(() => {
    if (isScannerOpen) return;

    if (focusVinAfterCloseRef.current) {
      focusVinAfterCloseRef.current = false;
      vinInputRef.current?.focus();
    } else if (focusScanButtonAfterCloseRef.current) {
      focusScanButtonAfterCloseRef.current = false;
      scanButtonRef.current?.focus();
    }
  }, [isScannerOpen]);

  function handleBarcodeDetected(payload: string) {
    const candidate = normalizeVinBarcodeResult(payload);
    if (!candidate) return;

    onVinChange(candidate);
    setBarcodeMessage(
      "VIN barcode detected. Review the VIN, then select Decode VIN.",
    );
    focusVinAfterCloseRef.current = true;
    setIsScannerOpen(false);
  }

  function handleScannerClose() {
    focusScanButtonAfterCloseRef.current = true;
    setIsScannerOpen(false);
  }

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
          onChange={(event) => {
            setBarcodeMessage("");
            onVinChange(event.target.value);
          }}
          ref={vinInputRef}
          className="field-control uppercase placeholder:normal-case"
        />
        {mode === "vin" && (
          <>
            <button
              ref={scanButtonRef}
              type="button"
              onClick={() => {
                setBarcodeMessage("");
                setIsScannerOpen(true);
              }}
              aria-haspopup="dialog"
              aria-controls="vin-barcode-scanner"
              className="button-secondary mt-2 w-full justify-center sm:w-auto"
            >
              SCAN VIN BARCODE
            </button>
            {barcodeMessage && (
              <p role="status" className="state-message mt-2" data-tone="success">
                {barcodeMessage}
              </p>
            )}
          </>
        )}
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
      {isScannerOpen && (
        <VinBarcodeScanner
          onCancel={handleScannerClose}
          onDetected={handleBarcodeDetected}
        />
      )}
      {shouldShowVehicleDetails && (
        <VehicleDetailFields
          enableSuggestions={mode === "manual"}
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
