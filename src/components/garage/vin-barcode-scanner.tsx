"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  createVinBarcodeScanner,
  getVinBarcodeCameraErrorMessage,
} from "@/lib/vin-barcode";

interface VinBarcodeScannerProps {
  onCancel: () => void;
  onDetected: (vin: string) => void;
}

export function VinBarcodeScanner({
  onCancel,
  onDetected,
}: VinBarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const acceptedVinRef = useRef(false);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onDetectedRef = useRef(onDetected);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Requesting camera access...");

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  useEffect(() => {
    const activeElement = document.activeElement;
    previousFocusRef.current =
      activeElement instanceof HTMLElement ? activeElement : null;
    cancelButtonRef.current?.focus();

    return () => {
      if (!acceptedVinRef.current) previousFocusRef.current?.focus();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const video = videoRef.current;
    if (!video) return;

    const scanner = createVinBarcodeScanner(video, {
      onCameraReady: () => setStatusMessage("Scanning for VIN barcode..."),
      onDetected: (candidate) => {
        acceptedVinRef.current = true;
        onDetectedRef.current(candidate);
      },
      onInvalidBarcode: () => {
        setStatusMessage("Barcode detected, but it is not a valid VIN.");
      },
    });
    const startupTimer = window.setTimeout(() => {
      void scanner.start().catch((error: unknown) => {
        scanner.stop();
        if (!cancelled) {
          setCameraError(getVinBarcodeCameraErrorMessage(error));
        }
      });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(startupTimer);
      scanner.stop();
    };
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
      return;
    }
    if (event.key === "Tab") {
      event.preventDefault();
      cancelButtonRef.current?.focus();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/85 p-3 sm:items-center sm:p-4"
      onKeyDown={handleKeyDown}
    >
      <section
        id="vin-barcode-scanner"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vin-barcode-scanner-title"
        aria-describedby="vin-barcode-scanner-description"
        className="surface-primary max-h-[92vh] w-full max-w-xl min-w-0 overflow-y-auto rounded-t-xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:rounded-xl sm:p-6"
      >
        <p className="technical-label text-accent">Vehicle intake / VIN</p>
        <h2
          id="vin-barcode-scanner-title"
          className="mt-2 text-lg font-semibold text-white"
        >
          SCAN VIN BARCODE
        </h2>
        <p
          id="vin-barcode-scanner-description"
          className="mt-1 text-sm text-zinc-400"
        >
          Position the vehicle VIN barcode inside the frame.
        </p>

        <div className="relative mt-4 aspect-[4/3] w-full min-w-0 overflow-hidden border border-zinc-700 bg-black">
          <video
            ref={videoRef}
            muted
            playsInline
            aria-label="Camera preview for VIN barcode scanning"
            className="h-full w-full object-cover"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-[12%] border-2 border-lime-300/80"
          />
        </div>

        {cameraError ? (
          <p role="alert" className="state-message mt-3" data-tone="error">
            {cameraError}
          </p>
        ) : (
          <p
            role={statusMessage.startsWith("Barcode detected") ? "alert" : "status"}
            aria-live="polite" className="mt-3 text-sm text-zinc-300"
          >
            {statusMessage}
          </p>
        )}

        <button
          ref={cancelButtonRef}
          type="button"
          onClick={onCancel}
          className="button-secondary mt-4 w-full justify-center"
        >
          CANCEL
        </button>
      </section>
    </div>
  );
}
