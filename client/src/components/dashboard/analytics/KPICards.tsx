"use client";

import { Card } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";

export interface KPICardConfig {
  title: string;
  value: string | React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  invertTrendColors?: boolean;
}

interface KPICardsProps {
  kpiConfigs: KPICardConfig[];
}

function KPICard({
  title,
  value,
  trend,
  trendValue,
  invertTrendColors,
}: KPICardConfig) {
  const getTrendColor = () => {
    if (!trend || trend === "neutral") return "text-muted-foreground";

    const isPositive = trend === "up";
    const shouldBeGreen = invertTrendColors ? !isPositive : isPositive;

    return shouldBeGreen
      ? "text-success bg-success/10"
      : "text-destructive bg-destructive/10";
  };

  const getTrendIconColor = () => {
    if (!trend || trend === "neutral") return "";

    const isPositive = trend === "up";
    const shouldBeGreen = invertTrendColors ? !isPositive : isPositive;

    return shouldBeGreen ? "text-success" : "text-destructive";
  };

  return (
    <Card className="px-6 py-4">
      <div className="flex flex-col gap-2">
        <p className="text-base text-muted-foreground">{title}</p>
        <div className="flex items-baseline gap-3">
          <p className="text-3xl font-semibold">{value}</p>
          {trendValue && (
            <div className="flex items-center">
              <span
                className={`text-sm font-medium flex flex-row items-center rounded-full px-2 py-1 ${getTrendColor()}`}
              >
                {" "}
                {trend === "up" && (
                  <ArrowUp
                    strokeWidth={3}
                    className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${getTrendIconColor()}`}
                  />
                )}
                {trend === "down" && (
                  <ArrowDown
                    strokeWidth={3}
                    className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${getTrendIconColor()}`}
                  />
                )}
                {trendValue}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function KPICards({ kpiConfigs }: KPICardsProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
      {kpiConfigs.map((kpi) => (
        <KPICard
          key={kpi.title}
          title={kpi.title}
          value={kpi.value}
          trend={kpi.trend}
          trendValue={kpi.trendValue}
          invertTrendColors={kpi.invertTrendColors}
        />
      ))}
    </div>
  );
}
