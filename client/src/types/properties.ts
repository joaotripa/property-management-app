import { PropertyType } from "@prisma/client";

export interface Property {
  id: string;
  name: string;
  address: string;
  type: PropertyType;
  rent: number;
  occupancy: string;
  tenants: number;
  image: string;
}
