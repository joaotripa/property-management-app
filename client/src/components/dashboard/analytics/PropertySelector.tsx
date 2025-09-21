"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      <div className={`w-full sm:w-auto sm:min-w-[140px] md:min-w-[160px] lg:min-w-[180px] xl:min-w-[200px] ${className}`}>
        <Select disabled>
          <SelectTrigger className="h-8 sm:h-9 md:h-10">
            <SelectValue placeholder="Loading..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  return (
    <div className={`w-full sm:w-auto sm:min-w-[140px] md:min-w-[160px] lg:min-w-[180px] xl:min-w-[200px] ${className}`}>
      <Select value={getCurrentValue()} onValueChange={handleValueChange}>
        <SelectTrigger className="h-8 sm:h-9 md:h-10">
          <div className="flex items-center min-w-0">
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>
        <SelectContent>
          {includeAllOption && (
            <SelectItem value="all">
              <div className="flex items-center">All Properties</div>
            </SelectItem>
          )}
          {properties.map((property) => (
            <SelectItem key={property.id} value={property.id}>
              <div className="flex flex-col min-w-0">
                <span className="truncate text-sm">{property.name}</span>
                <span className="truncate text-xs text-muted-foreground">{property.address}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
