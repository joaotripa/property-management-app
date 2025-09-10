"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2 } from "lucide-react";
import { getPropertyComparison } from "@/lib/services/analyticsService";
import { formatCurrency } from "@/components/analytics/KPICards";
import { PropertyRankingData } from "@/lib/db/analytics/queries";

interface TopPropertiesData {
  properties: PropertyRankingData[];
}

export function TopPropertiesCard() {
  const [data, setData] = useState<TopPropertiesData>({ properties: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchTopProperties = async () => {
      try {
        setIsLoading(true);
        setError("");

        // Get current month date range
        const now = new Date();
        const dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
        const dateTo = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const result = await getPropertyComparison({
          dateFrom,
          dateTo,
          sortBy: 'netIncome',
        });

        setData({ properties: result.propertyRanking.slice(0, 4) });
      } catch (err) {
        console.error("Error fetching top properties:", err);
        setError("Failed to load top properties data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopProperties();
  }, []);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Top Properties This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive py-8">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Top Properties</CardTitle>
          <div className="text-sm text-muted-foreground">This month</div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : data.properties.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No property data available for this month.
          </div>
        ) : (
          <div className="space-y-4">
            {data.properties.map((property, index) => {
              const colors = ["bg-blue-500", "bg-cyan-500", "bg-green-500", "bg-orange-500"];
              
              return (
                <div key={property.propertyId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colors[index]}`} />
                    <div>
                      <h4 className="font-semibold text-base">
                        {property.propertyName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Rank #{index + 1} by net income
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {formatCurrency(property.netIncome)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ROI: {property.roi.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}