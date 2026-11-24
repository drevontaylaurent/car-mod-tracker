"use client";

import { useState, useTransition } from "react";
import { lookupVinAction } from "@/actions/vehicles";
import { AddVehicleForm } from "@/components/garage/add-vehicle-form";
import { AddVehicleMethodSelection } from "@/components/garage/add-vehicle-method-selection";
import type { VehicleEntryMode } from "@/components/garage/vehicle-fields";

interface AddVehicleModalProps {
  onClose: () => void;
}

export function AddVehicleModal({ onClose }: AddVehicleModalProps) {
  const [mode, setMode] = useState<VehicleEntryMode | null>(null);
  const [vin, setVin] = useState("");
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [trim, setTrim] = useState("");
  const [nickname, setNickname] = useState("");
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  const [decodeError, setDecodeError] = useState("");
  const [decodeMessage, setDecodeMessage] = useState("");
  const [isDecoding, startDecode] = useTransition();

  function chooseMode(nextMode: VehicleEntryMode) {
    setMode(nextMode);
  }

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
      setShowVehicleDetails(true);
      setDecodeMessage("Decoded vehicle details. Review and edit before saving.");
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-vehicle-heading"
        aria-describedby="add-vehicle-description"
        className="surface-primary max-h-[90vh] w-full max-w-2xl overflow-y-auto p-5 sm:p-7"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="technical-label text-accent">Garage / Vehicle intake</p>
            <h2
              id="add-vehicle-heading"
              className="mt-2 text-xl font-semibold text-white"
            >
              Add Vehicle
            </h2>
            <p id="add-vehicle-description" className="mt-1 text-sm text-zinc-400">
              {mode
                ? mode === "vin"
                  ? "Start with a VIN, then review the decoded details."
                  : "Enter your vehicle details and VIN."
                : "Choose how to add your vehicle."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cancel adding vehicle"
            className="button-ghost h-11 w-11 shrink-0 p-0 text-lg"
          >
            ×
          </button>
        </div>

        {mode ? (
          <AddVehicleForm
            mode={mode}
            vin={vin}
            year={year}
            make={make}
            model={model}
            trim={trim}
            nickname={nickname}
            showVehicleDetails={showVehicleDetails}
            decodeError={decodeError}
            decodeMessage={decodeMessage}
            isDecoding={isDecoding}
            onBack={() => setMode(null)}
            onCancel={onClose}
            onSwitchMode={chooseMode}
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
        ) : (
          <AddVehicleMethodSelection
            onSelectMode={chooseMode}
            onCancel={onClose}
          />
        )}
      </section>
    </div>
  );
}
