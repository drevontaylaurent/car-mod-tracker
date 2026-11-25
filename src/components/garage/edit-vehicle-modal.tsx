"use client";

import { useActionState, useState } from "react";
import { updateVehicle } from "@/actions/vehicles";
import { VehicleFields } from "@/components/garage/vehicle-fields";
import { VehiclePhotoManager } from "@/components/garage/vehicle-photo-manager";
import type { VehicleWithMedia } from "@/types/vehicle-media";

interface EditVehicleModalProps {
  vehicle: VehicleWithMedia;
  onClose: () => void;
}

const noop = () => {};

export function EditVehicleModal({
  vehicle,
  onClose,
}: EditVehicleModalProps) {
  const [state, formAction, isPending] = useActionState(updateVehicle, undefined);
  const [vin, setVin] = useState(vehicle.vin ?? "");
  const [year, setYear] = useState(vehicle.year?.toString() ?? "");
  const [make, setMake] = useState(vehicle.make ?? "");
  const [model, setModel] = useState(vehicle.model ?? "");
  const [trim, setTrim] = useState(vehicle.trim ?? "");
  const [nickname, setNickname] = useState(vehicle.nickname ?? "");
  const vehicleName =
    vehicle.nickname ||
    [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ") ||
    "Vehicle profile";

  function handleYearChange(value: string) {
    setYear(value);
    setModel("");
    setTrim("");
  }

  function handleMakeChange(value: string) {
    setMake(value);
    setModel("");
    setTrim("");
  }

  function handleModelChange(value: string) {
    setModel(value);
    setTrim("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-vehicle-heading"
        aria-describedby="edit-vehicle-description"
        className="surface-primary max-h-[90vh] w-full max-w-2xl overflow-y-auto p-5 sm:p-7"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="technical-label text-accent">Garage / Vehicle profile</p>
            <h2
              id="edit-vehicle-heading"
              className="mt-2 text-xl font-semibold text-white"
            >
              Edit Vehicle
            </h2>
            <p
              id="edit-vehicle-description"
              className="mt-1 text-sm text-zinc-400"
            >
              Update vehicle details. VIN is optional.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Cancel editing vehicle"
            className="button-ghost h-11 w-11 shrink-0 p-0 text-lg"
          >
            ×
          </button>
        </div>

        <form action={formAction}>
          <input type="hidden" name="vehicleId" value={vehicle.id} />
          <VehicleFields
            mode="manual"
            showVehicleDetails
            vin={vin}
            year={year}
            make={make}
            model={model}
            trim={trim}
            nickname={nickname}
            decodeError=""
            decodeMessage=""
            isDecoding={false}
            onVinChange={setVin}
            onYearChange={handleYearChange}
            onMakeChange={handleMakeChange}
            onModelChange={handleModelChange}
            onTrimChange={setTrim}
            onNicknameChange={setNickname}
            onDecode={noop}
          />
          {state && !state.success && (
            <p role="alert" className="state-message mt-4" data-tone="error">
              {state.error}
            </p>
          )}
          {state?.success && (
            <p role="status" className="state-message mt-4" data-tone="success">
              Vehicle changes saved.
            </p>
          )}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="button-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="button-primary"
            >
              {isPending ? "Saving changes..." : "Save Changes"}
            </button>
          </div>
        </form>
        <VehiclePhotoManager
          key={`${vehicle.id}:${vehicle.photo_path ?? "none"}`}
          vehicleId={vehicle.id}
          vehicleName={vehicleName}
          hasPhoto={Boolean(vehicle.photo_path)}
          photoUrl={vehicle.photoUrl}
        />
      </section>
    </div>
  );
}
