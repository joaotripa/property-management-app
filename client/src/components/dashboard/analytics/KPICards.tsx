"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";

export interface KPICardConfig {
  title: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

interface KPICardsProps {
  kpiConfigs: KPICardConfig[];
}

function KPICard({ title, value, trend, trendValue }: KPICardConfig) {
  return (
    <Card className="border-secondary py-3 sm:py-4 md:py-5 justify-between !gap-0 min-w-0">
      <CardHeader className="px-3 sm:px-4 md:px-5 pb-2">
        <CardTitle className="font-medium text-muted-foreground text-xs sm:text-sm md:text-base truncate">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-row items-end px-3 sm:px-4 md:px-5 gap-1 min-w-0">
        <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold min-w-0 flex-shrink-0">
          {value}
        </div>
        {trendValue && (
          <div className="flex items-center mb-1 flex-shrink-0">
            {trend === "up" && (
              <ArrowUp
                strokeWidth={3}
                className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-success font-medium"
              />
            )}
            {trend === "down" && (
              <ArrowDown strokeWidth={3} className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive" />
            )}
            <span
              className={`text-xs sm:text-sm font-medium ${
                trend === "up"
                  ? "text-success"
                  : trend === "down"
                    ? "text-destructive"
                    : "text-muted-foreground"
              }`}
            >
              {trendValue}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function KPICards({ kpiConfigs }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
      {kpiConfigs.map((kpi) => (
        <KPICard
          key={kpi.title}
          title={kpi.title}
          value={kpi.value}
          trend={kpi.trend}
          trendValue={kpi.trendValue}
        />
      ))}
    </div>
  );
}
