"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  removeVehiclePhoto,
  uploadVehiclePhoto,
} from "@/actions/vehicle-media";
import { VehicleVisual } from "@/components/garage/vehicle-visual";
import { MAX_VEHICLE_PHOTO_BYTES } from "@/lib/vehicle-media-constants";

interface VehiclePhotoManagerProps {
  vehicleId: string;
  vehicleName: string;
  hasPhoto: boolean;
  photoUrl: string | null;
}

const photoAccept = "image/jpeg,image/png,image/webp,image/avif";

export function VehiclePhotoManager({
  vehicleId,
  vehicleName,
  hasPhoto: initialHasPhoto,
  photoUrl: initialPhotoUrl,
}: VehiclePhotoManagerProps) {
  const router = useRouter();
  const uploadFormRef = useRef<HTMLFormElement>(null);
  const [uploadState, uploadAction, isUploading] = useActionState(
    uploadVehiclePhoto,
    undefined,
  );
  const [removeState, removeAction, isRemoving] = useActionState(
    removeVehiclePhoto,
    undefined,
  );
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    if (!uploadState?.success) return;
    uploadFormRef.current?.reset();
    router.refresh();
  }, [router, uploadState]);

  useEffect(() => {
    if (!removeState?.success) return;
    router.refresh();
  }, [removeState, router]);

  function handleFileChange(file: File | undefined) {
    setFileError(
      file && file.size > MAX_VEHICLE_PHOTO_BYTES
        ? "Vehicle photos must be 4 MB or smaller."
        : null,
    );
  }

  const uploadError = fileError ?? (
    uploadState && !uploadState.success ? uploadState.error : null
  );
  const hasPhoto = removeState?.success
    ? false
    : uploadState?.success
      ? true
      : initialHasPhoto;
  const photoUrl = removeState?.success
    ? null
    : uploadState?.success
      ? uploadState.data.photoUrl
      : initialPhotoUrl;

  return (
    <section className="vehicle-photo-manager" aria-labelledby="vehicle-photo-heading">
      <div className="vehicle-photo-manager__heading">
        <div>
          <p className="technical-label text-accent">Vehicle / Media</p>
          <h3 id="vehicle-photo-heading">Vehicle photo</h3>
          <p id={`vehicle-photo-format-${vehicleId}`}>
            JPEG, PNG, WebP, or AVIF · Up to 4 MB
          </p>
        </div>
        <span className="vehicle-photo-manager__status">
          {hasPhoto ? "PHOTO SAVED" : "FALLBACK ACTIVE"}
        </span>
      </div>

      {photoUrl && (
        <div className="vehicle-photo-manager__preview">
          <VehicleVisual
            vehicleName={vehicleName}
            photoUrl={photoUrl}
          />
        </div>
      )}

      <form
        ref={uploadFormRef}
        action={uploadAction}
        className="vehicle-photo-manager__upload"
        aria-busy={isUploading}
      >
        <input type="hidden" name="vehicleId" value={vehicleId} />
        <label htmlFor={`vehicle-photo-${vehicleId}`} className="field-label">
          Choose a photo
        </label>
        <input
          id={`vehicle-photo-${vehicleId}`}
          name="photo"
          type="file"
          accept={photoAccept}
          required
          disabled={isUploading || isRemoving}
          aria-describedby={`vehicle-photo-format-${vehicleId}`}
          onChange={(event) => handleFileChange(event.currentTarget.files?.[0])}
          className="field-control vehicle-photo-manager__file"
        />
        {uploadError && (
          <p role="alert" className="state-message" data-tone="error">
            {uploadError}
          </p>
        )}
        {uploadState?.success && (
          <p role="status" className="state-message" data-tone="success">
            {uploadState.data.notice ?? "Vehicle photo saved."}
          </p>
        )}
        <button
          type="submit"
          disabled={isUploading || isRemoving || Boolean(fileError)}
          className="button-secondary vehicle-photo-manager__action"
        >
          {isUploading
            ? "Uploading photo..."
            : hasPhoto
              ? "CHANGE PHOTO"
              : "UPLOAD PHOTO"}
        </button>
      </form>

      {hasPhoto && (
        <form action={removeAction} aria-busy={isRemoving}>
          <input type="hidden" name="vehicleId" value={vehicleId} />
          {removeState && !removeState.success && (
            <p role="alert" className="state-message" data-tone="error">
              {removeState.error}
            </p>
          )}
          <button
            type="submit"
            disabled={isUploading || isRemoving}
            className="button-ghost vehicle-photo-manager__remove"
          >
            {isRemoving ? "Removing photo..." : "REMOVE PHOTO"}
          </button>
        </form>
      )}
    </section>
  );
}
