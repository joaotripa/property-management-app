import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Euro,
  Home,
  LandPlot,
  MapPinHouse,
  Building2,
  Globe,
} from "lucide-react";
import { Property } from "@/types/properties";
import { formatCurrency } from "@/lib/utils/formatting";

interface PropertyInfoCardProps {
  property: Property;
}

export function PropertyInfoCard({ property }: PropertyInfoCardProps) {
  const city = property.city || null;
  const country = property.country || null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Information</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Property Name</span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              {property.name}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <LandPlot className="w-4 h-4" />
              <span className="text-sm font-medium">Property Type</span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              {property.type}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <MapPinHouse className="w-4 h-4" />
              <span className="text-sm font-medium">Address</span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              {property.address}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="text-sm font-medium">City</span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">{city}</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">Country</span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">{country}</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Euro className="w-4 h-4" />
              <span className="text-sm font-medium">Purchase Price</span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              {property.purchasePrice
                ? formatCurrency(property.purchasePrice)
                : "Not specified"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}