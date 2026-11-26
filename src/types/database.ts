import type {
  VehicleDiagnostic,
  VehicleDiagnosticInsert,
  VehicleDiagnosticUpdate,
} from "@/types/diagnostics";
import type {
  BuildPhase,
  BuildPhaseInsert,
  BuildPhaseUpdate,
} from "@/types/build-timeline";

export interface Vehicle {
  id: string;
  user_id: string;
  vin: string | null;
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  nickname: string | null;
  photo_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleInsert {
  id?: string;
  user_id: string;
  vin: string | null;
  year?: number | null;
  make?: string | null;
  model?: string | null;
  trim?: string | null;
  nickname?: string | null;
  photo_path?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type VehicleUpdate = Partial<Omit<VehicleInsert, "user_id">>;

export const MOD_CATEGORIES = [
  "Engine",
  "Suspension",
  "Exhaust",
  "Exterior",
  "Interior",
  "Wheels/Tires",
  "Electronics",
] as const;

export type ModCategory = (typeof MOD_CATEGORIES)[number];

export const MOD_STATUSES = ["Wishlist", "Ordered", "Installed"] as const;

export type ModStatus = (typeof MOD_STATUSES)[number];

export interface Mod {
  id: string;
  vehicle_id: string;
  user_id: string;
  part_name: string;
  brand: string | null;
  category: ModCategory;
  status: ModStatus;
  phase_id: string | null;
  cost: number;
  install_date: string | null;
  notes: string | null;
  purchase_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ModInsert {
  id?: string;
  vehicle_id: string;
  user_id: string;
  part_name: string;
  brand?: string | null;
  category: ModCategory;
  status?: ModStatus;
  phase_id?: string | null;
  cost?: number;
  install_date?: string | null;
  notes?: string | null;
  purchase_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type ModUpdate = Partial<
  Omit<ModInsert, "id" | "user_id" | "vehicle_id" | "created_at">
>;

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
      mods: {
        Row: Mod & Record<string, unknown>;
        Insert: ModInsert & Record<string, unknown>;
        Update: ModUpdate & Record<string, unknown>;
        Relationships: [];
      };
      build_phases: {
        Row: BuildPhase & Record<string, unknown>;
        Insert: BuildPhaseInsert & Record<string, unknown>;
        Update: BuildPhaseUpdate & Record<string, unknown>;
        Relationships: [];
      };
      vehicle_diagnostics: {
        Row: VehicleDiagnostic & Record<string, unknown>;
        Insert: VehicleDiagnosticInsert & Record<string, unknown>;
        Update: VehicleDiagnosticUpdate & Record<string, unknown>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
