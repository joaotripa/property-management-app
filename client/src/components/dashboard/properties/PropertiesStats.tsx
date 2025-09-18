import React from "react";
import {
  KPICards,
  KPICardConfig,
} from "@/components/dashboard/analytics/KPICards";
import { formatCurrency } from "@/lib/utils/index";
import { usePropertyStats } from "@/hooks/usePropertyStats";

const PropertiesStats = () => {
  const { stats, isLoading } = usePropertyStats();

  if (isLoading || !stats) {
    const loadingKpis: KPICardConfig[] = [
      { title: "Total Properties", value: "0" },
      { title: "Vacant Properties", value: "0" },
      { title: "Occupied Properties", value: "0" },
      { title: "Average Rent", value: "0" },
    ];

    return <KPICards kpiConfigs={loadingKpis} />;
  }

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
      value: formatCurrency(stats.averageRent),
    },
  ];

  return <KPICards kpiConfigs={kpiConfigs} />;
};

export default PropertiesStats;
