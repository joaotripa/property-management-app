"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Home } from "lucide-react";

export interface PropertyOption {
  id: string;
  name: string;
  address: string;
}

interface PropertySelectorProps {
  properties: PropertyOption[];
  selectedPropertyId?: string;
  onPropertyChange: (propertyId: string | undefined) => void;
  placeholder?: string;
  includeAllOption?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function PropertySelector({
  properties,
  selectedPropertyId,
  onPropertyChange,
  placeholder = "Select property",
  includeAllOption = true,
  isLoading = false,
  className = "",
}: PropertySelectorProps) {
  const handleValueChange = (value: string) => {
    if (value === "all") {
      onPropertyChange(undefined);
    } else {
      onPropertyChange(value);
    }
  };

  const getCurrentValue = () => {
    if (!selectedPropertyId) return "all";
    return selectedPropertyId;
  };

  if (isLoading) {
    return (
      <div className={`min-w-[200px] ${className}`}>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Loading properties..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  return (
    <div className={`min-w-[200px] ${className}`}>
      <Select value={getCurrentValue()} onValueChange={handleValueChange}>
        <SelectTrigger>
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>
        <SelectContent>
          {includeAllOption && (
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                All Properties
              </div>
            </SelectItem>
          )}
          {properties.map((property) => (
            <SelectItem key={property.id} value={property.id}>
              <div className="flex flex-col">
                <span className="font-medium">{property.name}</span>
                <span className="text-xs text-muted-foreground">{property.address}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}