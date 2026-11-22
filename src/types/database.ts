export interface Vehicle {
  id: string;
  user_id: string;
  vin: string;
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  nickname: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleInsert {
  id?: string;
  user_id: string;
  vin: string;
  year?: number | null;
  make?: string | null;
  model?: string | null;
  trim?: string | null;
  nickname?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type VehicleUpdate = Partial<Omit<VehicleInsert, "user_id">>;

export interface Mod {
  id: string;
  vehicle_id: string;
  user_id: string;
  name: string;
  category: string;
  brand: string | null;
  part_number: string | null;
  cost: number | null;
  installed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DecodedVin {
  vin: string;
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  bodyClass: string | null;
  engine: string | null;
  driveType: string | null;
  fuelType: string | null;
}

export interface Database {
  public: {
    Tables: {
      vehicles: {
        Row: Vehicle & Record<string, unknown>;
        Insert: VehicleInsert & Record<string, unknown>;
        Update: VehicleUpdate & Record<string, unknown>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
