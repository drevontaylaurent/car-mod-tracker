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
