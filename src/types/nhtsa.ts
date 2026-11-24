export interface DecodedVehicleInfo {
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
}

export interface NhtsaVinDecodeResult {
  ModelYear?: string | null;
  Make?: string | null;
  Model?: string | null;
  Trim?: string | null;
}

export interface NhtsaVinDecodeResponse {
  Results: NhtsaVinDecodeResult[];
}

export interface NhtsaMakeResult {
  Make_ID: number;
  Make_Name: string;
}

export interface NhtsaModelResult {
  Make_ID: number;
  Make_Name: string;
  Model_ID: number;
  Model_Name: string;
}

export type ManualVehicleSuggestionRequest =
  | { type: "make"; query: string }
  | { type: "model"; year: number; make: string };
