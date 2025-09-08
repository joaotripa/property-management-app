import { PropertyType, OccupancyStatus } from "@prisma/client";

export interface Property {
  id: string;
  name: string;
  address: string;
  city?: string;
  country?: string;
  purchasePrice?: number;
  marketValue?: number;
  type: PropertyType;
  rent: number;
  occupancy: OccupancyStatus;
  tenants: number;
}
