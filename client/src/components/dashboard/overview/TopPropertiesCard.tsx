import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { formatCompactCurrency } from "@/lib/utils/formatting";
import { getTrendData } from "@/lib/utils/analytics";
import { PropertyRankingData } from "@/lib/db/analytics/queries";

interface TopPropertiesCardProps {
  topProperties: PropertyRankingData[];
  previousTopProperties: PropertyRankingData[];
}

export function TopPropertiesCard({
  topProperties,
  previousTopProperties,
}: TopPropertiesCardProps) {

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
        {topProperties.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No property data available for this month.
          </div>
        ) : (
          <div className="flex flex-col gap-6 mb-4">
            {topProperties.map((property, index) => {
              const colors = [
                { bg: "bg-primary", bgLight: "bg-primary/10" },
                { bg: "bg-cyan-500", bgLight: "bg-cyan-500/10" },
                { bg: "bg-success", bgLight: "bg-success/10" },
                { bg: "bg-orange-500", bgLight: "bg-orange-500/10" },
              ];

              const previousProperty = previousTopProperties.find(
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
