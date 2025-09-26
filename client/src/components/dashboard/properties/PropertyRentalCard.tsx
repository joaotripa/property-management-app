import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Property } from "@/types/properties";
import { OccupancyStatus } from "@prisma/client";
import { formatCurrency } from "@/lib/utils/formatting";

interface PropertyRentalCardProps {
  property: Property;
}

export function PropertyRentalCard({ property }: PropertyRentalCardProps) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Rental Information</CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-0">
        <div className="grid grid-cols-1 sm:grid-cols-3">
          <div className="flex flex-col gap-2 p-6 items-center">
            <p className="text-sm text-muted-foreground">
              Expected Monthly Rent
            </p>
            <p className="text-3xl font-semibold">
              {formatCurrency(property.rent)}
            </p>
          </div>

          <div className="flex flex-col gap-2 p-6 items-center ">
            <p className="text-sm text-muted-foreground">Current Tenants</p>
            <p className="text-3xl font-semibold">{property.tenants}</p>
          </div>

          <div className="flex flex-col gap-2 p-6 items-center">
            <p className="text-sm text-muted-foreground">Availability</p>
            <Badge
              variant={
                property.occupancy === OccupancyStatus.AVAILABLE
                  ? "secondary"
                  : "default"
              }
              className={`w-fit ${
                property.occupancy === OccupancyStatus.AVAILABLE
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {property.occupancy}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}