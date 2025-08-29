import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Euro, Calendar, Users } from "lucide-react";
import { usePropertyStats } from "@/hooks/usePropertyStats";

const PropertiesStats = () => {
  const { stats, isLoading, error } = usePropertyStats();

  if (error) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="col-span-2 lg:col-span-4 bg-destructive/10 border-destructive/20">
          <CardContent className="p-4 text-center">
            <p className="text-destructive text-sm">
              Failed to load statistics
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const LoadingSkeleton = ({ className }: { className?: string }) => (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-24 bg-muted-foreground/30 animate-pulse rounded" />
        <div className="h-4 w-4 bg-muted-foreground/30 animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-16 bg-muted-foreground/30 animate-pulse rounded mb-2" />
        <div className="h-3 w-20 bg-muted-foreground/30 animate-pulse rounded" />
      </CardContent>
    </Card>
  );

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <LoadingSkeleton className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20" />
        <LoadingSkeleton className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20" />
        <LoadingSkeleton className="bg-gradient-to-br from-success/10 to-success/5 border-success/20" />
        <LoadingSkeleton className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover-scale transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-dark">
            Total Properties
          </CardTitle>
          <Home className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold text-primary mb-2">
            {stats.totalProperties}
          </div>
          <div className="text-xs text-primary">All active</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20 hover-scale transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-dark">
            Occupied Properties
          </CardTitle>
          <Users className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold text-destructive mb-2">
            {stats.occupiedProperties}
          </div>
          <div className="text-xs text-destructive">
            {stats.occupancyRate}% occupancy
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20 hover-scale transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-dark">
            Vacant Properties
          </CardTitle>
          <Calendar className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold text-success mb-2">
            {stats.availableProperties}
          </div>
          <div className="text-xs text-success">Available now</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover-scale transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-dark">
            Avg. Rent
          </CardTitle>
          <Euro className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold text-primary mb-2">
            €{Math.round(stats.averageRent)}
          </div>
          <div className="text-xs text-primary">Monthly average</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertiesStats;
