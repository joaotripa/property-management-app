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
import { Plus, MapPin, Euro, Users, Home } from "lucide-react";
import { PropertyDetailsDialog } from "@/components/dashboard/properties/PropertyDetailsDialog";
import { PropertyAddDialog } from "@/components/dashboard/properties/PropertyAddDialog";
import { PropertyImage } from "@/components/dashboard/properties/PropertyImage";
import { EmptyPropertiesState } from "@/components/dashboard/properties/EmptyPropertiesState";
import { Property, OccupancyStatus } from "@/types/properties";
import { useRouter } from "next/navigation";

interface PropertiesClientProps {
  properties: Property[];
}

export function PropertiesClient({ properties }: PropertiesClientProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const router = useRouter();

  const openPropertyDialog = (property: Property) => {
    setSelectedProperty(property);
    setIsDetailsOpen(true);
  };

  const handleSaveProperty = async () => {
    // Refresh the page to get updated data
    router.refresh();
  };

  const handleAddProperty = async () => {
    // Refresh the page to get updated data
    router.refresh();
  };

  const handleDeleteProperty = async () => {
    // Refresh the page to get updated data
    router.refresh();
  };

  const openAddDialog = () => {
    setIsAddDialogOpen(true);
  };

  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
  };

  if (properties.length === 0) {
    return <EmptyPropertiesState onAddProperty={openAddDialog} />;
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {properties.map((property) => (
          <Card
            key={property.id}
            onClick={() => openPropertyDialog(property)}
            className="overflow-hidden p-0 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="h-50 w-full bg-muted/20 overflow-hidden">
              <PropertyImage
                propertyId={property.id}
                propertyName={property.name}
                className="w-full h-full object-cover"
                width={400}
                height={240}
              />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {property.name}
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    property.occupancy === OccupancyStatus.OCCUPIED
                      ? "bg-destructive/10 text-destructive"
                      : "bg-success/10 text-success"
                  }`}
                >
                  {property.occupancy}
                </span>
              </CardTitle>
              <CardDescription className="flex items-center text-muted-foreground/80 gap-2 h-6 mt-2">
                <MapPin className="w-4 h-4" />
                {property.address}
              </CardDescription>
            </CardHeader>
            <CardContent className="mb-2">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground/80 flex items-center gap-1">
                    <Home className="w-4 h-4" />
                    Type
                  </span>
                  <span className="text-sm">{property.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground/80 flex items-center gap-1">
                    <Euro className="w-4 h-4" />
                    Monthly Rent
                  </span>
                  <span className="text-sm">€{property.rent}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground/80 flex items-center gap-1">
                    <Users className="w-4 h-4" />
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
        onClick={openAddDialog}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full hover:bg-primary/90 shadow-lg hover:shadow-xl transition-shadow"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Property Details Dialog */}
      <PropertyDetailsDialog
        property={selectedProperty}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedProperty(null);
        }}
        onSave={handleSaveProperty}
        onDelete={handleDeleteProperty}
      />

      {/* Property Add Dialog */}
      <PropertyAddDialog
        isOpen={isAddDialogOpen}
        onClose={closeAddDialog}
        onPropertyAdded={handleAddProperty}
      />
    </>
  );
}