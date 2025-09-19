import React from "react";
import {
  KPICards,
  KPICardConfig,
} from "@/components/dashboard/analytics/KPICards";
import { formatCompactCurrency } from "@/lib/utils/formatting";

interface PropertyStats {
  totalProperties: number;
  occupiedProperties: number;
  availableProperties: number;
  occupancyRate: number;
  totalRent: number;
  averageRent: number;
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
      title: "Vacant Properties",
      value: stats.availableProperties.toString(),
    },
    {
      title: "Occupied Properties",
      value: stats.occupiedProperties.toString(),
    },
    {
      title: "Average Rent",
      value: formatCompactCurrency(stats.averageRent),
    },
  ];

  return <KPICards kpiConfigs={kpiConfigs} />;
};

export default PropertiesStats;
