import type { Vehicle } from "@/types/database";

export interface VehicleWithMedia extends Vehicle {
  photoUrl: string | null;
}

export interface VehiclePhotoActionData {
  photoPath: string | null;
  photoUrl: string | null;
  notice?: string;
}

export type VehiclePhotoMimeType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/avif";

export type VehiclePhotoStorageResult =
  | { success: true; data: null }
  | { success: false; statusCode?: string };
