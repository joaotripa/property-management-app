"use client";

import {
  useState,
  useTransition,
  useEffect,
  useCallback,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X, ChevronDown, ChevronRight } from "lucide-react";
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
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryOption, PropertyOption } from "@/types/transactions";
import { TransactionType } from "@/types/transactions";
import { toCamelCase } from "@/lib/utils/index";
import { Separator } from "@/components/ui/separator";
import { DateRangePicker, DateRange } from "@/components/ui/date-range-picker";

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
  const [isPending, startTransition] = useTransition();
  const [isExpanded, setIsExpanded] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current filter values from URL (excluding search - handled by table)
  const getCurrentFilters = () => {
    return {
      type: searchParams.get("type") || "all",
      dateFrom: searchParams.get("dateFrom") || "",
      dateTo: searchParams.get("dateTo") || "",
      amountMin: searchParams.get("amountMin") || "",
      amountMax: searchParams.get("amountMax") || "",
      categoryIds:
        searchParams.get("categoryIds")?.split(",").filter(Boolean) || [],
      propertyId: searchParams.get("propertyId") || "all",
      sortBy: searchParams.get("sortBy") || "transactionDate",
      sortOrder: searchParams.get("sortOrder") || "desc",
    };
  };

  const currentFilters = getCurrentFilters();

  // Initialize date range from URL
  useEffect(() => {
    const newDateRange: DateRange = {};
    if (currentFilters.dateFrom) {
      newDateRange.from = new Date(currentFilters.dateFrom);
    }
    if (currentFilters.dateTo) {
      newDateRange.to = new Date(currentFilters.dateTo);
    }

    if (newDateRange.from || newDateRange.to) {
      setDateRange(newDateRange);
    } else {
      setDateRange(undefined);
    }
  }, [currentFilters.dateFrom, currentFilters.dateTo]);

  const updateURL = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams);

      // Apply updates
      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== "all") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Reset to page 1 when filters change
      params.delete("page");

      router.push(`/dashboard/transactions?${params.toString()}`);
    },
    [router, searchParams]
  );


  const handleInstantFilter = (key: string, value: string | undefined) => {
    startTransition(() => {
      updateURL({ [key]: value });
    });
  };

  const toggleCategory = (categoryId: string) => {
    const currentCategories = currentFilters.categoryIds;
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter((id) => id !== categoryId)
      : [...currentCategories, categoryId];

    startTransition(() => {
      updateURL({
        categoryIds:
          newCategories.length > 0 ? newCategories.join(",") : undefined,
      });
    });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);

    startTransition(() => {
      // Only update URL/apply filters when we have a complete range (both from and to)
      // or when clearing the range (range is undefined)
      if (!range || (range.from && range.to)) {
        updateURL({
          dateFrom: range?.from
            ? range.from.toISOString().split("T")[0]
            : undefined,
          dateTo: range?.to ? range.to.toISOString().split("T")[0] : undefined,
        });
      }
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      router.push(
        "/dashboard/transactions?sortBy=transactionDate&sortOrder=desc"
      );
    });
    setDateRange(undefined);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (currentFilters.dateFrom || currentFilters.dateTo) count++;
    if (currentFilters.type && currentFilters.type !== "all") count++;
    if (currentFilters.amountMin || currentFilters.amountMax) count++;
    if (currentFilters.categoryIds.length > 0) count++;
    if (showPropertyFilter && currentFilters.propertyId !== "all") count++;
    return count;
  };

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
          </CardTitle>
          <div className="flex items-center gap-2">
            {getActiveFiltersCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 px-2"
                disabled={isPending}
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            )}
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
          <div className="flex flex-col gap-2">
            <Select
              value={currentFilters.type}
              onValueChange={(value) => handleInstantFilter("type", value)}
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
          </div>

          {/* Categories */}
          {availableCategories.length > 0 && (
            <div className="flex flex-col gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between bg-transparent hover:bg-transparent hover:text-foreground font-normal"
                    disabled={isPending}
                  >
                    <span>
                      {currentFilters.categoryIds.length === 0
                        ? "All Categories"
                        : currentFilters.categoryIds.length === 1
                          ? availableCategories.find(
                              (c) => c.id === currentFilters.categoryIds[0]
                            )?.name
                          : `${currentFilters.categoryIds.length} categories selected`}
                    </span>
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {availableCategories.map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category.id}
                      className="capitalize"
                      checked={currentFilters.categoryIds.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                    >
                      {category.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Property Filter (if enabled) */}
          {showPropertyFilter && (
            <div className="flex flex-col gap-2">
              <Select
                value={currentFilters.propertyId}
                onValueChange={(value) =>
                  handleInstantFilter("propertyId", value)
                }
                disabled={isPending}
              >
                <SelectTrigger>
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
            </div>
          )}

          {/* Date Range Picker */}
          <div className="flex flex-col gap-2">
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={handleDateRangeChange}
              placeholder="Select date range"
              disabled={isPending}
              className="w-full"
            />
          </div>
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
                  value={currentFilters.amountMin}
                  onChange={(e) =>
                    handleInstantFilter("amountMin", e.target.value)
                  }
                  disabled={isPending}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Max Amount (€)</Label>
                <Input
                  type="number"
                  placeholder="1000.00"
                  value={currentFilters.amountMax}
                  onChange={(e) =>
                    handleInstantFilter("amountMax", e.target.value)
                  }
                  disabled={isPending}
                />
              </div>

              {/* Sort Options */}
              <div className="flex flex-col gap-2">
                <Label>Sort By</Label>
                <Select
                  value={currentFilters.sortBy}
                  onValueChange={(value) =>
                    handleInstantFilter("sortBy", value)
                  }
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
                  value={currentFilters.sortOrder}
                  onValueChange={(value) =>
                    handleInstantFilter("sortOrder", value)
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
