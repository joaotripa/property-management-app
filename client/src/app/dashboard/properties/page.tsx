"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Euro, Users } from "lucide-react";
import { PropertyDetailsDialog } from "@/components/properties/PropertyDetailsDialog";
import Image from "next/image";
import PropertiesStats from "@/components/properties/PropertiesStats";

interface Property {
  id: number;
  name: string;
  address: string;
  type: string;
  rent: number;
  occupancy: string;
  tenants: number;
  image: string;
}

const initialProperties: Property[] = [
  {
    id: 1,
    name: "Downtown Apartment",
    address: "123 Main St, City Center",
    type: "Residential",
    rent: 2500,
    occupancy: "Occupied",
    tenants: 2,
    image: "/properties/house1-template.jpg",
  },
  {
    id: 2,
    name: "Beachfront Villa",
    address: "456 Ocean Drive, Coastal Area",
    type: "Vacation",
    rent: 4200,
    occupancy: "Available",
    tenants: 0,
    image: "/properties/house2-template.jpg",
  },
  {
    id: 3,
    name: "Office Complex",
    address: "789 Business Blvd, Commercial District",
    type: "Commercial",
    rent: 8500,
    occupancy: "Occupied",
    tenants: 15,
    image: "/properties/house3-template.jpg",
  },
  {
    id: 4,
    name: "Suburban House",
    address: "321 Elm Street, Suburbs",
    type: "Residential",
    rent: 3200,
    occupancy: "Occupied",
    tenants: 4,
    image: "/properties/house4-template.jpg",
  },
];

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const openPropertyDialog = (property: Property) => {
    setSelectedProperty(property);
    setIsDetailsOpen(true);
  };

  const handleSaveProperty = (updatedProperty: Property) => {
    setProperties((prev) =>
      prev.map((prop) =>
        prop.id === updatedProperty.id ? updatedProperty : prop
      )
    );
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <PropertiesStats />
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {properties.map((property) => (
          <Card
            key={property.id}
            onClick={() => openPropertyDialog(property)}
            className="overflow-hidden pt-0"
          >
            <div className="aspect-video h-60 bg-muted/30">
              <Image
                src={property.image}
                alt={property.name}
                width={400}
                height={225}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {property.name}
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    property.occupancy === "Occupied"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-success/10 text-success"
                  }`}
                >
                  {property.occupancy}
                </span>
              </CardTitle>
              <CardDescription className="flex items-center gap-1 text-muted">
                <MapPin className="w-4 h-4" />
                {property.address}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Type</span>
                  <span className="text-sm">{property.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted flex items-center gap-1">
                    <Euro className="w-3 h-3" />
                    Monthly Rent
                  </span>
                  <span className="text-sm">€{property.rent}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Tenants
                  </span>
                  <span className="text-sm">{property.tenants}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Floating Add Button */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full hover:bg-primary/90 shadow-lg hover:shadow-xl transition-shadow"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Property Details Dialog */}
      <PropertyDetailsDialog
        property={selectedProperty}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onSave={handleSaveProperty}
      />
    </div>
  );
}
