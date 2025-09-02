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
import { PropertyAddDialog } from "@/components/properties/PropertyAddDialog";
import { PropertyImage } from "@/components/properties/PropertyImage";
import PropertiesStats from "@/components/properties/PropertiesStats";
import { PropertyCardSkeleton } from "@/components/properties/PropertyCardSkeleton";
import { EmptyPropertiesState } from "@/components/properties/EmptyPropertiesState";
import { Property } from "@/types/properties";
import { useUserProperties } from "@/hooks/useUserProperties";
import { usePropertyStats } from "@/hooks/usePropertyStats";
import { OccupancyStatus } from "@prisma/client";

export default function PropertiesPage() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { properties, isLoading, error, refetch } = useUserProperties();
  const { refetch: refetchStats } = usePropertyStats();

  const openPropertyDialog = (property: Property) => {
    setSelectedProperty(property);
    setIsDetailsOpen(true);
  };

  const handleSaveProperty = async () => {
    try {
      await Promise.all([refetch(), refetchStats()]);
    } catch (error) {
      console.error("Error updating property:", error);
    }
  };

  const handleAddProperty = async () => {
    try {
      await Promise.all([refetch(), refetchStats()]);
    } catch (error) {
      console.error("Error adding property:", error);
    }
  };

  const handleDeleteProperty = async () => {
    try {
      await Promise.all([refetch(), refetchStats()]);
    } catch (error) {
      console.error("Error deleting property:", error);
    }
  };

  const openAddDialog = () => {
    setIsAddDialogOpen(true);
  };

  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
  };

  if (error) {
    return (
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <PropertiesStats />
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-6 text-center">
            <p className="text-destructive font-medium">
              Failed to load properties
            </p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button
              onClick={() => {
                refetch();
              }}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <PropertiesStats />

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <EmptyPropertiesState onAddProperty={openAddDialog} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {properties.map((property) => (
            <Card
              key={property.id}
              onClick={() => openPropertyDialog(property)}
              className="overflow-hidden p-0"
            >
              <div className="h-50 w-full bg-muted-foreground/10 overflow-hidden">
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
                <CardDescription className="flex items-center gap-2 text-muted h-6 mt-2">
                  <MapPin className="w-4 h-4" />
                  {property.address}
                </CardDescription>
              </CardHeader>
              <CardContent className="mb-2">
                <div className="flex flex-col gap-2">
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
      )}

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
        onClose={() => setIsDetailsOpen(false)}
        onSave={handleSaveProperty}
        onDelete={handleDeleteProperty}
      />

      {/* Property Add Dialog */}
      <PropertyAddDialog
        isOpen={isAddDialogOpen}
        onClose={closeAddDialog}
        onPropertyAdded={handleAddProperty}
      />
    </div>
  );
}
