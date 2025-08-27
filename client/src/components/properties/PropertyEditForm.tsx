"use client";

import { useState } from "react";
import { PropertyType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X } from "lucide-react";
import { toCamelCase } from "@/lib/utils";

const getPropertyTypeOptions = () => {
  return Object.values(PropertyType).map((type) => ({
    value: type,
    label: toCamelCase(type),
  }));
};

interface Property {
  id: string;
  name: string;
  address: string;
  type: PropertyType;
  rent: number;
  occupancy: string;
  tenants: number;
  image: string;
}

interface PropertyEditFormProps {
  property: Property;
  onSave: (property: Property) => void;
  onCancel: () => void;
  onChange: (property: Property) => void;
}

export function PropertyEditForm({
  property,
  onSave,
  onCancel,
  onChange,
}: PropertyEditFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const propertyTypeOptions = getPropertyTypeOptions();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!property.name.trim()) {
      newErrors.name = "Property name is required";
    }

    if (!property.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!property.type) {
      newErrors.type = "Property type is required";
    }

    if (property.rent <= 0) {
      newErrors.rent = "Rent must be greater than 0";
    }

    if (property.tenants < 0) {
      newErrors.tenants = "Tenants cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(property);
    }
  };

  const handleInputChange = (field: keyof Property, value: string | number) => {
    const updatedProperty = { ...property, [field]: value };
    onChange(updatedProperty);

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Information */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Property Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Property Name</Label>
                <Input
                  id="name"
                  value={property.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Property Type</Label>
                <Select
                  value={property.type}
                  onValueChange={(value) =>
                    handleInputChange("type", value as PropertyType)
                  }
                >
                  <SelectTrigger
                    className={errors.type ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={property.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className={errors.address ? "border-destructive" : ""}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rental Information */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Rental Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rent">Monthly Rent (€)</Label>
                <Input
                  id="rent"
                  type="number"
                  value={property.rent}
                  onChange={(e) =>
                    handleInputChange("rent", parseInt(e.target.value) || 0)
                  }
                  className={errors.rent ? "border-destructive" : ""}
                />
                {errors.rent && (
                  <p className="text-sm text-destructive">{errors.rent}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenants">Current Tenants</Label>
                <Input
                  id="tenants"
                  type="number"
                  value={property.tenants}
                  onChange={(e) =>
                    handleInputChange("tenants", parseInt(e.target.value) || 0)
                  }
                  className={errors.tenants ? "border-destructive" : ""}
                />
                {errors.tenants && (
                  <p className="text-sm text-destructive">{errors.tenants}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupancy">Occupancy Status</Label>
                <Select
                  value={property.occupancy}
                  onValueChange={(value) =>
                    handleInputChange("occupancy", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select occupancy status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Occupied">Occupied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={onCancel}
          className="hover:bg-destructive hover:border-destructive hover:cursor-pointer"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="hover:bg-primary/90 hover:border-primary hover:cursor-pointer"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
