import type { BarcodeFormat, DecodeHintType } from "@zxing/library";

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;

interface StoppableScanner {
  stop: () => void;
}

interface VinBarcodeScannerHandlers {
  onCameraReady: () => void;
  onDetected: (vin: string) => void;
  onInvalidBarcode: () => void;
}

export function getVinBarcodeCameraErrorMessage(error: unknown): string {
  const errorName = error instanceof Error ? error.name : "";

  if (errorName === "NotAllowedError" || errorName === "SecurityError") {
    return "Camera permission is unavailable or denied. Cancel to enter the VIN manually.";
  }
  if (errorName === "NotFoundError" || errorName === "DevicesNotFoundError") {
    return "No camera was found. Cancel to enter the VIN manually.";
  }
  if (errorName === "NotReadableError" || errorName === "AbortError") {
    return "The camera could not start. Cancel to enter the VIN manually.";
  }
  if (errorName === "InsecureContextError") {
    return "Camera access requires a secure connection. Cancel to enter the VIN manually.";
  }
  if (errorName === "UnsupportedError") {
    return "Camera scanning is not supported here. Cancel to enter the VIN manually.";
  }

  return "The scanner could not start. Cancel to enter the VIN manually.";
}

export function normalizeVinBarcodeResult(payload: string): string | null {
  const candidate = payload.trim().toUpperCase();
  return VIN_PATTERN.test(candidate) ? candidate : null;
}

export function createVinBarcodeScanner(
  video: HTMLVideoElement,
  handlers: VinBarcodeScannerHandlers,
) {
  let stopped = false;
  let invalidBarcodeReported = false;
  let acceptedVin = false;
  let controls: StoppableScanner | null = null;
  let stream: MediaStream | null = null;

  function stop(activeControls?: StoppableScanner) {
    stopped = true;
    const activeScanner = activeControls ?? controls;
    controls = null;
    activeScanner?.stop();

    const activeStream = stream;
    stream = null;
    activeStream?.getTracks().forEach((track) => track.stop());
    if (video.srcObject === activeStream) video.srcObject = null;
  }

  async function start() {
    if (!window.isSecureContext) {
      throw new DOMException("Secure context required.", "InsecureContextError");
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new DOMException("Camera API unavailable.", "UnsupportedError");
    }

    const { BrowserMultiFormatReader } = await import("@zxing/browser");
    const { BarcodeFormat, DecodeHintType } = await import("@zxing/library");
    if (stopped) return;

    const formats: BarcodeFormat[] = [
      BarcodeFormat.CODE_39,
      BarcodeFormat.CODE_128,
      BarcodeFormat.DATA_MATRIX,
      BarcodeFormat.QR_CODE,
    ];
    const hints = new Map<DecodeHintType, BarcodeFormat[]>([
      [DecodeHintType.POSSIBLE_FORMATS, formats],
    ]);
    const reader = new BrowserMultiFormatReader(hints);
    const cameraStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });

    if (stopped) {
      cameraStream.getTracks().forEach((track) => track.stop());
      return;
    }

    stream = cameraStream;
    handlers.onCameraReady();
    const scannerControls = await reader.decodeFromStream(
      cameraStream,
      video,
      (result, _error, callbackControls) => {
        if (stopped || acceptedVin || !result) return;

        const candidate = normalizeVinBarcodeResult(result.getText());
        if (!candidate) {
          if (!invalidBarcodeReported) {
            invalidBarcodeReported = true;
            handlers.onInvalidBarcode();
          }
          return;
        }

        acceptedVin = true;
        stop(callbackControls);
        handlers.onDetected(candidate);
      },
    );

    controls = scannerControls;
    if (stopped || acceptedVin) stop(scannerControls);
  }

  return { start, stop };
}
