export interface BuildShare {
  id: string;
  vehicleId: string;
  token: string;
  isEnabled: boolean;
}

export interface SharedModification {
  name: string;
  category: string;
  status: "Installed" | "Ordered" | "Wishlist";
}

export interface SharedBuild {
  nickname: string | null;
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  totalModCount: number;
  installedCount: number;
  progress: number;
  modifications: SharedModification[];
}
