"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PropertyOption } from "@/types/transactions";

interface PropertyFilterProps {
  properties: PropertyOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function PropertyFilter({
  properties,
  value,
  onChange,
  disabled = false,
}: PropertyFilterProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="All Properties" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Properties</SelectItem>
        {properties.map((property) => (
          <SelectItem key={property.id} value={property.id}>
            {property.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
