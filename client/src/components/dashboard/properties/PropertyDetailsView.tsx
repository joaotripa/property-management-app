import type { PropertyImage } from "@prisma/client";
import { Property } from "@/types/properties";
import { Transaction } from "@/types/transactions";
import { PropertyImageCarousel } from "./PropertyImageCarousel";
import { PropertyInfoCard } from "./PropertyInfoCard";
import { PropertyRentalCard } from "./PropertyRentalCard";
import { PropertyPerformanceCard } from "./PropertyPerformanceCard";
import { PropertyRecentTransactionsCard } from "./PropertyRecentTransactionsCard";

interface PropertyDetailsViewProps {
  property: Property;
  propertyImages: PropertyImage[];
  loadingImages: boolean;
  currentMonthMetrics: {
    income: number;
    expenses: number;
    cashFlow: number;
    roi: number;
  } | null;
  transactions: Transaction[];
  isLoadingTransactions: boolean;
  transactionError?: { message: string } | null;
  onNavigateToTransactions?: (url: string) => void;
  timezone: string;
  currencyCode: string;
}

export function PropertyDetailsView({
  property,
  propertyImages,
  loadingImages,
  currentMonthMetrics,
  transactions,
  isLoadingTransactions,
  transactionError,
  onNavigateToTransactions,
  timezone,
  currencyCode,
}: PropertyDetailsViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Property Images Carousel */}
      <PropertyImageCarousel
        images={propertyImages}
        propertyName={property.name}
        isLoading={loadingImages}
      />

      {/* Property Information Card */}
      <PropertyInfoCard property={property} />

      {/* Rental Information */}
      <PropertyRentalCard property={property} />

      {/* Current Month Financial Performance */}
      <PropertyPerformanceCard metrics={currentMonthMetrics} />

      {/* Transaction Details */}
      <PropertyRecentTransactionsCard
        propertyId={property.id}
        propertyName={property.name}
        transactions={transactions}
        isLoading={isLoadingTransactions}
        error={transactionError}
        onNavigate={onNavigateToTransactions}
        timezone={timezone}
        currencyCode={currencyCode}
      />
    </div>
  );
}