"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadVehiclePhoto } from "@/actions/vehicle-media";
import { createVehicle } from "@/actions/vehicles";
import { VehicleVisual } from "@/components/garage/vehicle-visual";
import { VehicleFields } from "@/components/garage/vehicle-fields";
import type { VehicleEntryMode } from "@/components/garage/vehicle-fields";
import {
  MAX_VEHICLE_PHOTO_BYTES,
  VEHICLE_PHOTO_MIME_TYPES,
} from "@/lib/vehicle-media-constants";
import type { ActionResult } from "@/types/actions";
import type { VehiclePhotoActionData } from "@/types/vehicle-media";

type PhotoUploadState = ActionResult<VehiclePhotoActionData> | undefined;

const photoAccept = VEHICLE_PHOTO_MIME_TYPES.join(",");

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
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    createVehicle,
    undefined,
  );
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoFileError, setPhotoFileError] = useState<string | null>(null);
  const [photoState, setPhotoState] = useState<PhotoUploadState>();
  const [isUploadingPhoto, startPhotoUpload] = useTransition();
  const uploadedVehicleIdRef = useRef<string | null>(null);
  const canSave =
    (mode === "manual" || showVehicleDetails) && !photoFileError;
  const vehicleCreated = state?.success === true;
  const busy = isPending || isUploadingPhoto;

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoPreviewUrl]);

  useEffect(() => {
    if (!state?.success || !selectedPhoto) return;
    if (uploadedVehicleIdRef.current === state.data.id) return;

    uploadedVehicleIdRef.current = state.data.id;
    const photoFormData = new FormData();
    photoFormData.set("vehicleId", state.data.id);
    photoFormData.set("photo", selectedPhoto);
    startPhotoUpload(async () => {
      const result = await uploadVehiclePhoto(undefined, photoFormData);
      setPhotoState(result);
      if (result.success) router.refresh();
    });
  }, [router, selectedPhoto, state]);

  function handlePhotoChange(file: File | undefined) {
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    setPhotoState(undefined);

    if (!file) {
      setSelectedPhoto(null);
      setPhotoPreviewUrl(null);
      setPhotoFileError(null);
      return;
    }

    if (
      !VEHICLE_PHOTO_MIME_TYPES.some((mimeType) => mimeType === file.type)
    ) {
      setSelectedPhoto(null);
      setPhotoPreviewUrl(null);
      setPhotoFileError("Choose a JPEG, PNG, WebP, or AVIF vehicle photo.");
      return;
    }

    if (file.size > MAX_VEHICLE_PHOTO_BYTES) {
      setSelectedPhoto(null);
      setPhotoPreviewUrl(null);
      setPhotoFileError("Vehicle photos must be 4 MB or smaller.");
      return;
    }

    setSelectedPhoto(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
    setPhotoFileError(null);
  }

  return (
    <>
      <div className="add-vehicle__navigation">
        <button
          type="button"
          onClick={onBack}
          disabled={busy || vehicleCreated}
          className="button-ghost"
        >
          <span aria-hidden="true">←</span> Back to methods
        </button>
        <button
          type="button"
          onClick={() => onSwitchMode(mode === "vin" ? "manual" : "vin")}
          disabled={busy || vehicleCreated}
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

        <section
          className="add-vehicle-photo"
          aria-labelledby="add-vehicle-photo-heading"
        >
          <div className="vehicle-photo-manager__heading">
            <div>
              <p className="technical-label text-accent">Optional / Media</p>
              <h3 id="add-vehicle-photo-heading">Vehicle photo</h3>
              <p id="add-vehicle-photo-format">
                JPEG, PNG, WebP, or AVIF · Up to 4 MB
              </p>
            </div>
            <span className="vehicle-photo-manager__status">
              {selectedPhoto ? "PHOTO SELECTED" : "SKIP AVAILABLE"}
            </span>
          </div>

          {photoPreviewUrl && (
            <div className="vehicle-photo-manager__preview">
              <VehicleVisual
                vehicleName={nickname.trim() || "new vehicle"}
                photoUrl={photoPreviewUrl}
              />
            </div>
          )}

          <label htmlFor="add-vehicle-photo-file" className="field-label">
            Choose a photo
          </label>
          <input
            id="add-vehicle-photo-file"
            name="photo"
            type="file"
            accept={photoAccept}
            disabled={busy || vehicleCreated}
            aria-describedby="add-vehicle-photo-format"
            onChange={(event) =>
              handlePhotoChange(event.currentTarget.files?.[0])
            }
            className="field-control vehicle-photo-manager__file"
          />
          {selectedPhoto && (
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById(
                  "add-vehicle-photo-file",
                ) as HTMLInputElement | null;
                if (input) input.value = "";
                handlePhotoChange(undefined);
              }}
              disabled={busy || vehicleCreated}
              className="button-ghost add-vehicle-photo__remove"
            >
              Remove selected photo
            </button>
          )}
          {photoFileError && (
            <p role="alert" className="state-message" data-tone="error">
              {photoFileError}
            </p>
          )}
        </section>

        {state && !state.success && (
          <p role="alert" className="state-message mt-4" data-tone="error">
            {state.error}
          </p>
        )}
        {state?.success && !selectedPhoto && (
          <p role="status" className="state-message mt-4" data-tone="success">
            Vehicle added to your garage.
          </p>
        )}
        {state?.success && selectedPhoto && isUploadingPhoto && (
          <p role="status" className="state-message mt-4">
            Vehicle added. Uploading its photo...
          </p>
        )}
        {state?.success && photoState?.success && (
          <p role="status" className="state-message mt-4" data-tone="success">
            Vehicle and photo added to your garage.
          </p>
        )}
        {state?.success && photoState && !photoState.success && (
          <p role="alert" className="state-message mt-4" data-tone="error">
            Vehicle added, but its photo was not uploaded: {photoState.error} You
            can add or change the photo later from the vehicle media controls.
          </p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="button-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || !canSave || vehicleCreated}
            className="button-primary"
          >
            {isPending
              ? "Adding vehicle..."
              : isUploadingPhoto
                ? "Uploading photo..."
                : vehicleCreated
                  ? "Vehicle added"
                  : "Save vehicle"}
          </button>
        </div>
      </form>
    </>
  );
}
