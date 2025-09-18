"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, ArrowUp, ArrowDown } from "lucide-react";
import { getPropertyComparison } from "@/lib/services/client/analyticsService";
import { formatCompactCurrency } from "@/lib/utils/formatting";
import { getTrendData } from "@/lib/utils/analytics";
import { PropertyRankingData } from "@/lib/db/analytics/queries";

interface TopPropertiesData {
  properties: PropertyRankingData[];
  previousProperties: PropertyRankingData[];
}

export function TopPropertiesCard() {
  const [data, setData] = useState<TopPropertiesData>({
    properties: [],
    previousProperties: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchTopProperties = async () => {
      try {
        setIsLoading(true);
        setError("");

        // Get current month date range
        const now = new Date();
        const currentDateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentDateTo = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        // Get previous month date range
        const previousDateFrom = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        );
        const previousDateTo = new Date(now.getFullYear(), now.getMonth(), 0);

        const [currentResult, previousResult] = await Promise.allSettled([
          getPropertyComparison({
            dateFrom: currentDateFrom,
            dateTo: currentDateTo,
            sortBy: "netIncome",
          }),
          getPropertyComparison({
            dateFrom: previousDateFrom,
            dateTo: previousDateTo,
            sortBy: "netIncome",
          }),
        ]);

        setData({
          properties:
            currentResult.status === "fulfilled"
              ? currentResult.value.propertyRanking.slice(0, 4)
              : [],
          previousProperties:
            previousResult.status === "fulfilled"
              ? previousResult.value.propertyRanking
              : [],
        });

        if (currentResult.status === "rejected") {
          setError("Failed to load top properties data");
        }
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
          <div className="text-center text-destructive py-8">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Top Properties
          </CardTitle>
          <div className="text-sm text-muted-foreground">This month</div>
        </div>
        <CardDescription>
          Ranking of properties based on net income
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg bg-muted" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2 bg-muted" />
                    <Skeleton className="h-3 w-20 bg-muted" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 bg-muted" />
              </div>
            ))}
          </div>
        ) : data.properties.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No property data available for this month.
          </div>
        ) : (
          <div className="flex flex-col gap-6 mb-4">
            {data.properties.map((property, index) => {
              const colors = [
                { bg: "bg-primary", bgLight: "bg-primary/10" },
                { bg: "bg-cyan-500", bgLight: "bg-cyan-500/10" },
                { bg: "bg-success", bgLight: "bg-success/10" },
                { bg: "bg-orange-500", bgLight: "bg-orange-500/10" },
              ];

              const previousProperty = data.previousProperties.find(
                (p) => p.propertyId === property.propertyId
              );

              const trendData = getTrendData(
                property.netIncome,
                previousProperty?.netIncome
              );

              return (
                <div
                  key={property.propertyId}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 ${colors[index].bgLight} rounded-lg flex items-center justify-center`}
                    >
                      <div className={`w-4 h-4 ${colors[index].bg} rounded`} />
                    </div>
                    <div>
                      <h4 className="font-medium">{property.propertyName}</h4>
                      <p className="text-sm text-muted-foreground">
                        Rank #{index + 1}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCompactCurrency(property.netIncome)}
                    </div>
                    <div className="flex items-center justify-end gap-1 text-sm">
                      {trendData.trendValue ? (
                        <>
                          {trendData.trend === "up" && (
                            <ArrowUp className="h-3 w-3 text-success" />
                          )}
                          {trendData.trend === "down" && (
                            <ArrowDown className="h-3 w-3 text-destructive" />
                          )}
                          <span
                            className={`${
                              trendData.trend === "up"
                                ? "text-success"
                                : trendData.trend === "down"
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {trendData.trendValue}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">
                          vs last month
                        </span>
                      )}
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
