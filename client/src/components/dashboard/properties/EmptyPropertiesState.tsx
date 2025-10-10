"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Plus } from "lucide-react";

interface EmptyPropertiesStateProps {
  onAddProperty: () => void;
  disabled?: boolean;
}

export function EmptyPropertiesState({
  onAddProperty,
  disabled = false,
}: EmptyPropertiesStateProps) {
  return (
    <Card className="col-span-full">
      <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Home className="w-10 h-10 text-primary/60" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No Properties Yet
        </h3>
        <p className="text-muted-foreground mb-8 max-w-md">
          Start building your property portfolio by adding your first property.
          Track rent, manage tenants, and monitor your investments all in one
          place.
        </p>
        <Button
          onClick={onAddProperty}
          disabled={disabled}
          size="lg"
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Your First Property
        </Button>
      </CardContent>
    </Card>
  );
}
