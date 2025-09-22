"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

  const [pendingFilters, setPendingFilters] = useState(() =>
    getCurrentFilters()
  );
  const [hasChanges, setHasChanges] = useState(false);

  function getCurrentFilters() {
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
  }

  const currentFilters = getCurrentFilters();

  useEffect(() => {
    const urlFilters = getCurrentFilters();
    setPendingFilters(urlFilters);
    setHasChanges(false);
  }, [searchParams]);

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

      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== "all") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      params.delete("page");

      router.push(`/dashboard/transactions?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleFilterChange = (key: string, value: string | undefined) => {
    const newPendingFilters = { ...pendingFilters, [key]: value };
    setPendingFilters(newPendingFilters);
    setHasChanges(true);
  };

  const toggleCategory = (categoryId: string) => {
    const currentCategories = pendingFilters.categoryIds;
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter((id) => id !== categoryId)
      : [...currentCategories, categoryId];

    setPendingFilters({
      ...pendingFilters,
      categoryIds: newCategories,
    });
    setHasChanges(true);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);

    if (!range || (range.from && range.to)) {
      setPendingFilters({
        ...pendingFilters,
        dateFrom: range?.from ? range.from.toISOString().split("T")[0] : "",
        dateTo: range?.to ? range.to.toISOString().split("T")[0] : "",
      });
      setHasChanges(true);
    }
  };

  const applyFilters = () => {
    startTransition(() => {
      const updates: Record<string, string | undefined> = {};

      Object.entries(pendingFilters).forEach(([key, value]) => {
        if (key === "categoryIds") {
          updates[key] =
            (value as string[]).length > 0
              ? (value as string[]).join(",")
              : undefined;
        } else {
          updates[key] = (value as string) || undefined;
        }
      });

      updateURL(updates);
      setHasChanges(false);
    });
  };

  const clearAllFilters = () => {
    const defaultFilters = {
      type: "all",
      dateFrom: "",
      dateTo: "",
      amountMin: "",
      amountMax: "",
      categoryIds: [] as string[],
      propertyId: "all",
      sortBy: "transactionDate",
      sortOrder: "desc",
    };

    setPendingFilters(defaultFilters);
    setDateRange(undefined);

    startTransition(() => {
      router.push(
        "/dashboard/transactions?sortBy=transactionDate&sortOrder=desc"
      );
      setHasChanges(false);
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (currentFilters.dateFrom || currentFilters.dateTo) count++;
    if (currentFilters.type && currentFilters.type !== "all") count++;
    if (currentFilters.amountMin || currentFilters.amountMax) count++;
    if (currentFilters.categoryIds.length > 0) count++;
    if (showPropertyFilter && currentFilters.propertyId !== "all") count++;

    if (hasChanges) {
      let pendingCount = 0;
      if (pendingFilters.dateFrom || pendingFilters.dateTo) pendingCount++;
      if (pendingFilters.type && pendingFilters.type !== "all") pendingCount++;
      if (
        (pendingFilters.amountMin && pendingFilters.amountMin.trim()) ||
        (pendingFilters.amountMax && pendingFilters.amountMax.trim())
      )
        pendingCount++;
      if (pendingFilters.categoryIds.length > 0) pendingCount++;
      if (showPropertyFilter && pendingFilters.propertyId !== "all")
        pendingCount++;
      count = Math.max(count, pendingCount);
    }

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
              className="h-8 px-2"
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
          <div className="flex flex-col gap-2">
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
                  {availableCategories.map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category.id}
                      className="capitalize"
                      checked={pendingFilters.categoryIds.includes(category.id)}
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
                value={pendingFilters.propertyId}
                onValueChange={(value) =>
                  handleFilterChange("propertyId", value)
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
