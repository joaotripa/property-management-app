"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
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
  defaultValue?: string;
}

export function PropertySelector({
  properties,
  defaultValue = "all",
}: PropertySelectorProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPropertyId = searchParams.get("propertyId") || defaultValue;

  const handlePropertyChange = (value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);

      if (value === "all" || value === defaultValue) {
        params.delete("propertyId");
      } else {
        params.set("propertyId", value);
      }

      router.push(`/dashboard/analytics?${params.toString()}`, {
        scroll: false,
      });
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentPropertyId}
        onValueChange={handlePropertyChange}
        disabled={isPending}
      >
        <SelectTrigger
          className={`w-44 sm:w-48 h-8 ${isPending ? "opacity-70" : ""}`}
        >
          <SelectValue placeholder="Select property" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center">All Properties</div>
          </SelectItem>
          {properties.map((property) => (
            <SelectItem key={property.id} value={property.id}>
              <div className="flex flex-col items-start min-w-0">
                <span className="truncate text-sm">{property.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      )}
    </div>
  );
}
