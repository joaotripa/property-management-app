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
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { TransactionFilters } from "@/components/filters/TransactionFilters";
import { usePropertyTransactions } from "@/hooks/usePropertyTransactions";
import { useTransactionFilters } from "@/hooks/useTransactionFilters";
import { CategoryOption } from "@/types/transactions";
import { Property } from "@/types/properties";

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
  const [availableCategories, setAvailableCategories] = useState<
    CategoryOption[]
  >([]);

  const { filters, setFilters } = useTransactionFilters({
    propertyId: property?.id,
  });

  const { transactions, loading, error, totalCount } = usePropertyTransactions(
    property?.id,
    filters
  );

  useEffect(() => {
    if (!isOpen) {
      setMode("view");
      setEditProperty(null);
    }
  }, [isOpen, property?.id]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setAvailableCategories(data.categories);
      } catch (error) {
        console.error("Failed to load categories:", error);
        setAvailableCategories([]);
      }
    };

    if (isOpen && property) {
      loadCategories();
    }
  }, [isOpen, property]);

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
      <DialogContent className="!max-w-[80vw] max-h-[90vh] overflow-y-auto">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property Image */}
              <div className="flex flex-col gap-4">
                <Image
                  src={currentProperty.image}
                  alt={currentProperty.name}
                  width={400}
                  height={300}
                  className="w-full aspect-video rounded-lg object-cover"
                />
              </div>

              {/* Property Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Property Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted" />
                        <span className="text-sm font-medium">Address</span>
                      </div>
                      <p className="text-sm text-muted ml-6">
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

              {/* Financial & Occupancy Information */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Rental Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-center gap-2">
                        <Euro className="w-4 h-4 text-muted" />
                        <span className="text-sm font-medium">
                          Monthly Rent
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-center">
                        €{currentProperty.rent}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-center gap-2">
                        <Users className="w-4 h-4 text-muted" />
                        <span className="text-sm font-medium">
                          Current Tenants
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-center">
                        {currentProperty.tenants}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-center gap-2">
                        <Percent className="w-4 h-4 text-muted" />
                        <span className="text-sm font-medium">
                          Occupancy Rate
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-center">
                        {occupancyRate}%
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-center gap-2">
                        <span className="text-sm font-medium">
                          Availability
                        </span>
                      </div>
                      <div className="flex justify-center">
                        <Badge
                          variant={
                            currentProperty.occupancy === "Available"
                              ? "secondary"
                              : "default"
                          }
                          className={`${
                            currentProperty.occupancy === "Available"
                              ? "bg-green-100 text-success"
                              : "bg-red-100 text-destructive"
                          }`}
                        >
                          {currentProperty.occupancy}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transaction Details */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Transaction Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Transaction Filters */}
                  <TransactionFilters
                    onFiltersChange={setFilters}
                    showPropertyFilter={false}
                    initialPropertyId={currentProperty.id}
                    availableCategories={availableCategories}
                    initialFilters={filters}
                  />

                  {/* Transaction Table */}
                  <div className="mt-4">
                    {error ? (
                      <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4">
                        <p className="text-sm text-destructive">{error}</p>
                      </div>
                    ) : (
                      <TransactionTable
                        transactions={transactions}
                        loading={loading}
                        showPropertyColumn={false}
                        emptyMessage={`No transactions found for ${currentProperty.name}`}
                      />
                    )}

                    {/* Transaction Summary */}
                    {!loading && transactions.length > 0 && (
                      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          Showing {transactions.length} of {totalCount}{" "}
                          transactions
                        </span>
                      </div>
                    )}
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
