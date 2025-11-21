"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CategoryOption, PropertyOption } from "@/types/transactions";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useTransactionFilters } from "@/components/dashboard/transactions/hooks/useTransactionFilters";
import { FilterHeader } from "@/components/dashboard/transactions/components/filters/FilterHeader";
import { TypeFilter } from "@/components/dashboard/transactions/components/filters/TypeFilter";
import { CategoryFilter } from "@/components/dashboard/transactions/components/filters/CategoryFilter";
import { PropertyFilter } from "@/components/dashboard/transactions/components/filters/PropertyFilter";
import { AdvancedFilters } from "@/components/dashboard/transactions/components/filters/AdvancedFilters";

interface TransactionFiltersProps {
  availableCategories: CategoryOption[];
  availableProperties: PropertyOption[];
  showPropertyFilter?: boolean;
}

export function TransactionFilters({
  availableCategories = [],
  availableProperties = [],
  showPropertyFilter = false,
}: TransactionFiltersProps) {
  const {
    isPending,
    isExpanded,
    setIsExpanded,
    pendingFilters,
    dateRange,
    handleFilterChange,
    toggleCategory,
    handleDateRangeChange,
    applyFilters,
    clearAllFilters,
    getActiveFiltersCount,
  } = useTransactionFilters({ showPropertyFilter });

  return (
    <Card className="w-full">
      <CardHeader>
        <FilterHeader
          activeFiltersCount={getActiveFiltersCount()}
          isExpanded={isExpanded}
          onToggleExpanded={() => setIsExpanded(!isExpanded)}
          onClearFilters={clearAllFilters}
          onApplyFilters={applyFilters}
          disabled={isPending}
        />
      </CardHeader>

      <CardContent className="gap-4">
        {/* Basic Filters - Always visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <TypeFilter
            value={pendingFilters.type}
            onChange={(value) => handleFilterChange("type", value)}
            disabled={isPending}
          />

          <CategoryFilter
            categories={availableCategories}
            selectedCategoryIds={pendingFilters.categoryIds}
            onToggleCategory={toggleCategory}
            disabled={isPending}
          />

          {showPropertyFilter && (
            <PropertyFilter
              properties={availableProperties}
              value={pendingFilters.propertyId}
              onChange={(value) => handleFilterChange("propertyId", value)}
              disabled={isPending}
            />
          )}

          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            placeholder="Select date range"
            disabled={isPending}
            className="w-full"
          />
        </div>

        {/* Advanced Filters - Collapsible */}
        {isExpanded && (
          <AdvancedFilters
            amountMin={pendingFilters.amountMin}
            amountMax={pendingFilters.amountMax}
            sortBy={pendingFilters.sortBy}
            sortOrder={pendingFilters.sortOrder}
            onAmountMinChange={(value) => handleFilterChange("amountMin", value)}
            onAmountMaxChange={(value) => handleFilterChange("amountMax", value)}
            onSortByChange={(value) => handleFilterChange("sortBy", value)}
            onSortOrderChange={(value) => handleFilterChange("sortOrder", value)}
            disabled={isPending}
          />
        )}
      </CardContent>
    </Card>
  );
}
