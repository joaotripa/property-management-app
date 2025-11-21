export const PropertyType = {
  APARTMENT: "APARTMENT",
  HOUSE: "HOUSE",
  STUDIO: "STUDIO",
  TOWNHOUSE: "TOWNHOUSE",
  VILLA: "VILLA",
  COMMERCIAL: "COMMERCIAL",
  OFFICE: "OFFICE",
  RETAIL: "RETAIL",
  WAREHOUSE: "WAREHOUSE",
  MIXED_USE: "MIXED_USE",
  OTHER: "OTHER",
} as const;

export type PropertyType = typeof PropertyType[keyof typeof PropertyType];

export const OccupancyStatus = {
  AVAILABLE: "AVAILABLE",
  OCCUPIED: "OCCUPIED",
} as const;

export type OccupancyStatus = typeof OccupancyStatus[keyof typeof OccupancyStatus];

export interface Property {
  id: string;
  name: string;
  address: string;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  purchasePrice?: number | null;
  marketValue?: number | null;
  isActive?: boolean;
  deletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: string;
  type: PropertyType;
  rent: number;
  occupancy: OccupancyStatus;
  tenants: number;
  coverImageUrl?: string | null;
}
