"use client";

import { useState, useTransition, useDeferredValue, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Search, X, ChevronDown, ChevronRight } from "lucide-react";
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
  const [searchValue, setSearchValue] = useState("");
  const deferredSearchValue = useDeferredValue(searchValue);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current filter values from URL
  const getCurrentFilters = () => {
    return {
      type: searchParams.get('type') || 'all',
      dateFrom: searchParams.get('dateFrom') || '',
      dateTo: searchParams.get('dateTo') || '',
      amountMin: searchParams.get('amountMin') || '',
      amountMax: searchParams.get('amountMax') || '',
      categoryIds: searchParams.get('categoryIds')?.split(',').filter(Boolean) || [],
      isRecurring: searchParams.get('isRecurring') || 'all',
      propertyId: searchParams.get('propertyId') || 'all',
      search: searchParams.get('search') || '',
      sortBy: searchParams.get('sortBy') || 'transactionDate',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };
  };

  const currentFilters = getCurrentFilters();

  // Initialize search value from URL
  useEffect(() => {
    setSearchValue(currentFilters.search);
  }, [currentFilters.search]);

  const updateURL = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams);

    // Apply updates
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change
    params.delete('page');

    router.push(`/dashboard/transactions?${params.toString()}`);
  }, [router, searchParams]);

  // Debounced search with useTransition
  useEffect(() => {
    if (deferredSearchValue !== currentFilters.search) {
      const timeoutId = setTimeout(() => {
        startTransition(() => {
          updateURL({ search: deferredSearchValue || undefined });
        });
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [deferredSearchValue, currentFilters.search, updateURL]);

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
        categoryIds: newCategories.length > 0 ? newCategories.join(',') : undefined
      });
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      router.push('/dashboard/transactions?sortBy=transactionDate&sortOrder=desc');
    });
    setSearchValue('');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (currentFilters.dateFrom || currentFilters.dateTo) count++;
    if (currentFilters.type && currentFilters.type !== 'all') count++;
    if (currentFilters.amountMin || currentFilters.amountMax) count++;
    if (currentFilters.categoryIds.length > 0) count++;
    if (currentFilters.isRecurring !== 'all') count++;
    if (currentFilters.search) count++;
    if (showPropertyFilter && currentFilters.propertyId !== 'all') count++;
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
        <div className="flex gap-4 flex-col md:flex-row">
          <div className="flex-1 min-w-[180px]">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className={`pl-10 ${isPending ? 'opacity-70' : ''}`}
              />
              {isPending && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
          </div>

          {/* Transaction Type */}
          <div className="flex gap-2">
            <Select
              value={currentFilters.type}
              onValueChange={(value) => handleInstantFilter('type', value)}
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
            <div className="flex gap-2">
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
            <div className="flex flex-col">
              <Select
                value={currentFilters.propertyId}
                onValueChange={(value) => handleInstantFilter('propertyId', value)}
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
        </div>

        {/* Advanced Filters - Collapsible */}
        {isExpanded && (
          <div className="flex flex-col gap-6 mt-6">
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date From */}
              <div className="flex flex-col gap-2">
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={currentFilters.dateFrom}
                  onChange={(e) => handleInstantFilter('dateFrom', e.target.value)}
                  disabled={isPending}
                />
              </div>

              {/* Date To */}
              <div className="flex flex-col gap-2">
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={currentFilters.dateTo}
                  onChange={(e) => handleInstantFilter('dateTo', e.target.value)}
                  disabled={isPending}
                />
              </div>

              {/* Amount Range */}
              <div className="flex flex-col gap-2">
                <Label>Min Amount (€)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={currentFilters.amountMin}
                  onChange={(e) => handleInstantFilter('amountMin', e.target.value)}
                  disabled={isPending}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Max Amount (€)</Label>
                <Input
                  type="number"
                  placeholder="1000.00"
                  value={currentFilters.amountMax}
                  onChange={(e) => handleInstantFilter('amountMax', e.target.value)}
                  disabled={isPending}
                />
              </div>

              {/* Recurring Filter */}
              <div className="flex flex-col gap-2">
                <Label>Recurring</Label>
                <Select
                  value={currentFilters.isRecurring}
                  onValueChange={(value) => handleInstantFilter('isRecurring', value)}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Recurring Only</SelectItem>
                    <SelectItem value="false">Non-Recurring</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Options */}
              <div className="flex flex-col gap-2">
                <Label>Sort By</Label>
                <Select
                  value={currentFilters.sortBy}
                  onValueChange={(value) => handleInstantFilter('sortBy', value)}
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
                  onValueChange={(value) => handleInstantFilter('sortOrder', value)}
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