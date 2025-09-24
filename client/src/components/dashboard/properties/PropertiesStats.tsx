import React from "react";
import {
  KPICards,
  KPICardConfig,
} from "@/components/dashboard/analytics/KPICards";
import { formatCompactCurrency, formatPercentage } from "@/lib/utils/formatting";

interface PropertyStats {
  totalProperties: number;
  occupiedProperties: number;
  availableProperties: number;
  occupancyRate: number;
  totalRent: number;
  averageRent: number;
  portfolioROI: number;
}

interface PropertiesStatsProps {
  stats: PropertyStats;
}

const PropertiesStats = ({ stats }: PropertiesStatsProps) => {
  const kpiConfigs: KPICardConfig[] = [
    {
      title: "Total Properties",
      value: stats.totalProperties.toString(),
    },
    {
      title: "Occupied Properties",
      value: (
        <>
          <span className="text-3xl font-semibold">{stats.occupiedProperties}</span>
          <span className="ml-1 text-xl font-medium text-muted-foreground">
            /{stats.totalProperties}
          </span>
        </>
      ),
    },
    {
      title: "Average Rent",
      value: formatCompactCurrency(stats.averageRent),
    },
    {
      title: "Portfolio ROI %",
      value: formatPercentage(stats.portfolioROI),
    },
  ];

  return <KPICards kpiConfigs={kpiConfigs} />;
};

export default PropertiesStats;
