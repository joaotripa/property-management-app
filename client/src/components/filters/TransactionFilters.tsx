"use client";

import { useState, useEffect } from "react";
import { Filter, Search, X } from "lucide-react";
import { format } from "date-fns";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  TransactionFiltersProps,
  TransactionFilters as TransactionFiltersType,
} from "@/types/transactions";
import { TransactionType } from "@prisma/client";
import { toCamelCase } from "@/lib/utils";

export function TransactionFilters({
  onFiltersChange,
  showPropertyFilter = false,
  initialPropertyId,
  availableProperties = [],
  availableCategories = [],
  initialFilters = {},
}: TransactionFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<TransactionFiltersType>({
    type: "all",
    sortBy: "transactionDate",
    sortOrder: "desc",
    ...initialFilters,
    ...(initialPropertyId && { propertyId: initialPropertyId }),
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialFilters.categoryIds || []
  );

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const updateFilter = <K extends keyof TransactionFiltersType>(
    key: K,
    value: TransactionFiltersType[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    const clearedFilters: TransactionFiltersType = {
      type: "all",
      sortBy: "transactionDate",
      sortOrder: "desc",
      ...(initialPropertyId && { propertyId: initialPropertyId }),
    };
    setFilters(clearedFilters);
    setSelectedCategories([]);
  };

  const toggleCategory = (categoryId: string) => {
    const newSelectedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(newSelectedCategories);
    updateFilter(
      "categoryIds",
      newSelectedCategories.length > 0 ? newSelectedCategories : undefined
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.type && filters.type !== "all") count++;
    if (filters.amountMin !== undefined || filters.amountMax !== undefined)
      count++;
    if (filters.categoryIds && filters.categoryIds.length > 0) count++;
    if (filters.isRecurring !== undefined) count++;
    if (filters.search) count++;
    if (showPropertyFilter && filters.propertyId && !initialPropertyId) count++;
    return count;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
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
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 px-2"
            >
              {isExpanded ? "Less" : "More"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Filters - Always visible */}
        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={filters.search || ""}
                onChange={(e) =>
                  updateFilter("search", e.target.value || undefined)
                }
                className="pl-10"
              />
            </div>
          </div>

          {/* Transaction Type */}
          <div className="space-y-2">
            <Select
              value={filters.type || "all"}
              onValueChange={(value) =>
                updateFilter("type", value as TransactionType | "all")
              }
            >
              <SelectTrigger className="w-full sm:w-[150px]">
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
            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
                {availableCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={
                      selectedCategories.includes(category.id)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => toggleCategory(category.id)}
                    className="h-7 text-xs"
                  >
                    {category.name}
                    {selectedCategories.includes(category.id) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Property Filter (if enabled) */}
          {showPropertyFilter && (
            <div className="space-y-2">
              <Label>Property</Label>
              <Select
                value={filters.propertyId || ""}
                onValueChange={(value) =>
                  updateFilter("propertyId", value || undefined)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Properties</SelectItem>
                  {availableProperties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Advanced Filters - Collapsible */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Date From */}
              <div className="space-y-2">
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={
                    filters.dateFrom
                      ? format(filters.dateFrom, "yyyy-MM-dd")
                      : ""
                  }
                  onChange={(e) =>
                    updateFilter(
                      "dateFrom",
                      e.target.value ? new Date(e.target.value) : undefined
                    )
                  }
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={
                    filters.dateTo ? format(filters.dateTo, "yyyy-MM-dd") : ""
                  }
                  onChange={(e) =>
                    updateFilter(
                      "dateTo",
                      e.target.value ? new Date(e.target.value) : undefined
                    )
                  }
                />
              </div>
              {/* Amount Range */}
              <div className="space-y-2">
                <Label>Min Amount (€)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={filters.amountMin ?? ""}
                  onChange={(e) =>
                    updateFilter(
                      "amountMin",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Max Amount (€)</Label>
                <Input
                  type="number"
                  placeholder="1000.00"
                  value={filters.amountMax ?? ""}
                  onChange={(e) =>
                    updateFilter(
                      "amountMax",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>

              {/* Recurring Filter */}
              <div className="space-y-2">
                <Label>Recurring</Label>
                <Select
                  value={
                    filters.isRecurring === undefined
                      ? "all"
                      : filters.isRecurring.toString()
                  }
                  onValueChange={(value) =>
                    updateFilter(
                      "isRecurring",
                      value === "all" ? undefined : value === "true"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Recurring Only</SelectItem>
                    <SelectItem value="false">Non-Recurring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select
                  value={filters.sortBy || "transactionDate"}
                  onValueChange={(value) =>
                    updateFilter("sortBy", value as any)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transactionDate">Date</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Select
                  value={filters.sortOrder || "desc"}
                  onValueChange={(value) =>
                    updateFilter("sortOrder", value as "asc" | "desc")
                  }
                >
                  <SelectTrigger>
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
