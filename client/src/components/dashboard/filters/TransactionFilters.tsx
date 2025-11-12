"use client";

import { Filter, X, ChevronDown, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryOption, PropertyOption } from "@/types/transactions";
import { TransactionType } from "@/types/transactions";
import { toCamelCase } from "@/lib/utils/index";
import { Separator } from "@/components/ui/separator";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useTransactionFilters } from "@/components/dashboard/transactions/hooks/useTransactionFilters";

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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 bg-primary text-background"
              >
                {getActiveFiltersCount()}
              </Badge>
            )}
            {getActiveFiltersCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-8 px-2 ml-2"
                disabled={isPending}
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={applyFilters}
              className="h-8 px-4"
              disabled={isPending}
            >
              <Search className="h-4 w-4" />
              Apply
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 px-2"
            >
              {isExpanded ? <ChevronDown /> : <ChevronRight />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="gap-4">
        {/* Basic Filters - Always visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Transaction Type */}
          <Select
            value={pendingFilters.type}
            onValueChange={(value) => handleFilterChange("type", value)}
            disabled={isPending}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value={TransactionType.INCOME}>
                {toCamelCase(TransactionType.INCOME)}
              </SelectItem>
              <SelectItem value={TransactionType.EXPENSE}>
                {toCamelCase(TransactionType.EXPENSE)}
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Categories */}
          {availableCategories.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-transparent hover:bg-transparent hover:text-foreground font-normal"
                  disabled={isPending}
                >
                  <span>
                    {pendingFilters.categoryIds.length === 0
                      ? "All Categories"
                      : pendingFilters.categoryIds.length === 1
                        ? availableCategories.find(
                            (c) => c.id === pendingFilters.categoryIds[0]
                          )?.name
                        : `${pendingFilters.categoryIds.length} categories selected`}
                  </span>
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Income</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {availableCategories
                      .filter((c) => c.type === TransactionType.INCOME)
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((category) => (
                        <DropdownMenuCheckboxItem
                          key={category.id}
                          className="capitalize"
                          checked={pendingFilters.categoryIds.includes(
                            category.id
                          )}
                          onCheckedChange={() => toggleCategory(category.id)}
                        >
                          {category.name}
                        </DropdownMenuCheckboxItem>
                      ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Expense</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {availableCategories
                      .filter((c) => c.type === TransactionType.EXPENSE)
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((category) => (
                        <DropdownMenuCheckboxItem
                          key={category.id}
                          className="capitalize"
                          checked={pendingFilters.categoryIds.includes(
                            category.id
                          )}
                          onCheckedChange={() => toggleCategory(category.id)}
                        >
                          {category.name}
                        </DropdownMenuCheckboxItem>
                      ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Property Filter (if enabled) */}
          {showPropertyFilter && (
            <Select
              value={pendingFilters.propertyId}
              onValueChange={(value) => handleFilterChange("propertyId", value)}
              disabled={isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {availableProperties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Date Range Picker */}
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
          <div className="flex flex-col gap-6 mt-6">
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Amount Range */}
              <div className="flex flex-col gap-2">
                <Label>Min Amount (€)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={pendingFilters.amountMin}
                  onChange={(e) =>
                    handleFilterChange("amountMin", e.target.value)
                  }
                  disabled={isPending}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Max Amount (€)</Label>
                <Input
                  type="number"
                  placeholder="1000.00"
                  value={pendingFilters.amountMax}
                  onChange={(e) =>
                    handleFilterChange("amountMax", e.target.value)
                  }
                  disabled={isPending}
                />
              </div>

              {/* Sort Options */}
              <div className="flex flex-col gap-2">
                <Label>Sort By</Label>
                <Select
                  value={pendingFilters.sortBy}
                  onValueChange={(value) => handleFilterChange("sortBy", value)}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transactionDate">Date</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Sort Order</Label>
                <Select
                  value={pendingFilters.sortOrder}
                  onValueChange={(value) =>
                    handleFilterChange("sortOrder", value)
                  }
                  disabled={isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
