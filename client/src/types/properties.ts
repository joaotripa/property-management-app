import { PropertyType, OccupancyStatus } from "@prisma/client";

export interface Property {
  id: string;
  name: string;
  address: string;
  type: PropertyType;
  rent: number;
  occupancy: OccupancyStatus;
  tenants: number;
}
