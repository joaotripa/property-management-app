"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  Euro,
  Users,
  Edit,
  Home,
  Percent,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { PropertyEditForm } from "./PropertyEditForm";

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

interface PropertyDetailsDialogProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: Property) => void;
}

export function PropertyDetailsDialog({
  property,
  isOpen,
  onClose,
  onSave,
}: PropertyDetailsDialogProps) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [editProperty, setEditProperty] = useState<Property | null>(null);

  // Reset to view mode when dialog is closed or property changes
  useEffect(() => {
    if (!isOpen) {
      setMode("view");
      setEditProperty(null);
    }
  }, [isOpen, property?.id]);

  if (!property) return null;

  const currentProperty = editProperty || property;
  const occupancyRate = currentProperty.occupancy === "Occupied" ? 100 : 0;
  const city = currentProperty.address.split(",")[1]?.trim() || "Unknown City";
  const country = "Portugal";

  const handleEdit = () => {
    setEditProperty({ ...property });
    setMode("edit");
  };

  const handleBackToView = () => {
    setMode("view");
    setEditProperty(null);
  };

  const handleSave = () => {
    if (editProperty) {
      onSave(editProperty);
      setMode("view");
      setEditProperty(null);
    }
  };

  const handleCancel = () => {
    setMode("view");
    setEditProperty(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[80vw] w-[90vw] max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col p-6 gap-6">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {mode === "edit" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToView}
                    className="p-1 hover:bg-primary"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}
                <div className="flex items-center gap-2 text-sm text-primary">
                  <span
                    className={
                      mode === "view" ? "text-foreground font-semibold" : ""
                    }
                  >
                    Property Details
                  </span>
                  {mode === "edit" && (
                    <>
                      <ChevronRight className="w-4 h-4" />
                      <span className="text-foreground font-semibold">
                        Edit Property
                      </span>
                    </>
                  )}
                </div>
              </div>
              {mode === "view" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="hover:bg-primary hover:cursor-pointer"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Content based on active mode */}
          {mode === "view" ? (
            <div className="space-y-6">
              {/* Property Image */}
              <div className="flex flex-row justify-between gap-2">
                <Image
                  src={currentProperty.image}
                  alt={currentProperty.name}
                  width={200}
                  height={100}
                  className="w-2xl aspect-video rounded-lg object-cover"
                />
                <Card>
                  <CardHeader>
                    <CardTitle>Property Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Address</span>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">
                          {currentProperty.address}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">City</span>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">
                          {city}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Country</span>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">
                          {country}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            Property Type
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">
                          {currentProperty.type}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Financial & Occupancy Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Rental Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Euro className="w-4 h-4 text-muted" />
                        <span className="text-sm font-medium">
                          Monthly Rent
                        </span>
                      </div>
                      <p className="text-lg font-semibold ml-6">
                        €{currentProperty.rent}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted" />
                        <span className="text-sm font-medium">
                          Current Tenants
                        </span>
                      </div>
                      <p className="text-lg font-semibold ml-6">
                        {currentProperty.tenants}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-muted" />
                        <span className="text-sm font-medium">
                          Occupancy Rate
                        </span>
                      </div>
                      <p className="text-lg font-semibold">{occupancyRate}%</p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm font-medium">Availability</span>
                      <Badge
                        variant={
                          currentProperty.occupancy === "Available"
                            ? "secondary"
                            : "default"
                        }
                        className={`ml-2 ${
                          currentProperty.occupancy === "Available"
                            ? "bg-green-100 text-success"
                            : "bg-red-100 text-destructive"
                        }`}
                      >
                        {currentProperty.occupancy}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <PropertyEditForm
              property={currentProperty}
              onSave={handleSave}
              onCancel={handleCancel}
              onChange={(updatedProperty) => setEditProperty(updatedProperty)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
