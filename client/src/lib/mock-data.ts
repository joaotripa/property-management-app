import { PropertyType } from "@prisma/client";
import { Property } from "@/types/properties";

export const mockProperties: Property[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Downtown Apartment",
    address: "123 Main St, City Center",
    type: PropertyType.APARTMENT,
    rent: 2500,
    occupancy: "Occupied",
    tenants: 2,
    image: "/properties/house1-template.jpg",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Beachfront Villa",
    address: "456 Ocean Drive, Coastal Area",
    type: PropertyType.VILLA,
    rent: 4200,
    occupancy: "Available",
    tenants: 0,
    image: "/properties/house2-template.jpg",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    name: "Office Complex",
    address: "789 Business Blvd, Commercial District",
    type: PropertyType.OFFICE,
    rent: 8500,
    occupancy: "Occupied",
    tenants: 15,
    image: "/properties/house3-template.jpg",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    name: "Suburban House",
    address: "321 Elm Street, Suburbs",
    type: PropertyType.HOUSE,
    rent: 3200,
    occupancy: "Occupied",
    tenants: 4,
    image: "/properties/house4-template.jpg",
  },
];
