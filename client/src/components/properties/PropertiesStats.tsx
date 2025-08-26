import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Euro, Calendar, Users } from "lucide-react";

const PropertiesStats = () => {
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
            12
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
            8
          </div>
          <div className="text-xs text-destructive">67% occupancy</div>
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
            4
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
            €380
          </div>
          <div className="text-xs text-primary">+8% vs last month</div>
        </CardContent>
      </Card>
    </div>
    /*<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover-scale transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-dark">
            Total Properties
          </CardTitle>
          <Home className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold text-primary mb-2">
            12
          </div>
          <div className="text-xs text-primary">All active</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover-scale transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-dark">
            Occupied Properties
          </CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold text-destructive mb-2">
            8
          </div>
          <div className="text-xs text-destructive">67% occupancy</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover-scale transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-dark">
            Vacant Properties
          </CardTitle>
          <Calendar className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold text-success mb-2">
            4
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
            €380
          </div>
          <div className="text-xs text-primary">+8% vs last month</div>
        </CardContent>
      </Card>
    </div>*/
  );
};

export default PropertiesStats;
