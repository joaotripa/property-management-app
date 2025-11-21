"use client";

import { useState, useTransition, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { DateRange } from "@/components/ui/date-range-picker";
import { formatDateForInput } from "@/lib/utils/timezone";
import { TRANSACTION_QUERY_KEYS } from "@/hooks/queries/transaction-query-keys";

interface FilterValues {
  type: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
  categoryIds: string[];
  propertyId: string;
  sortBy: string;
  sortOrder: string;
}

const DEFAULT_FILTER_VALUES: FilterValues = {
  type: "all",
  dateFrom: "",
  dateTo: "",
  amountMin: "",
  amountMax: "",
  categoryIds: [],
  propertyId: "all",
  sortBy: "transactionDate",
  sortOrder: "desc",
};

interface UseTransactionFiltersProps {
  showPropertyFilter?: boolean;
}

export function useTransactionFilters({ showPropertyFilter = false }: UseTransactionFiltersProps = {}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [pendingFilters, setPendingFilters] = useState<FilterValues>(() => ({
    type: searchParams.get("type") || DEFAULT_FILTER_VALUES.type,
    dateFrom: searchParams.get("dateFrom") || DEFAULT_FILTER_VALUES.dateFrom,
    dateTo: searchParams.get("dateTo") || DEFAULT_FILTER_VALUES.dateTo,
    amountMin: searchParams.get("amountMin") || DEFAULT_FILTER_VALUES.amountMin,
    amountMax: searchParams.get("amountMax") || DEFAULT_FILTER_VALUES.amountMax,
    categoryIds: searchParams.get("categoryIds")?.split(",").filter(Boolean) || DEFAULT_FILTER_VALUES.categoryIds,
    propertyId: searchParams.get("propertyId") || DEFAULT_FILTER_VALUES.propertyId,
    sortBy: searchParams.get("sortBy") || DEFAULT_FILTER_VALUES.sortBy,
    sortOrder: searchParams.get("sortOrder") || DEFAULT_FILTER_VALUES.sortOrder,
  }));

  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = useCallback((key: string, value: string | undefined) => {
    setPendingFilters((prev) => ({
      ...prev,
      [key]: value || "",
    }));
  }, []);

  const toggleCategory = useCallback((categoryId: string) => {
    setPendingFilters((prev) => {
      const currentCategories = prev.categoryIds;
      const newCategories = currentCategories.includes(categoryId)
        ? currentCategories.filter((id) => id !== categoryId)
        : [...currentCategories, categoryId];

      return {
        ...prev,
        categoryIds: newCategories,
      };
    });
  }, []);

  const dateRange = useMemo<DateRange | undefined>(() => {
    if (!pendingFilters.dateFrom && !pendingFilters.dateTo) return undefined;

    const range: DateRange = {};
    if (pendingFilters.dateFrom) range.from = new Date(pendingFilters.dateFrom);
    if (pendingFilters.dateTo) range.to = new Date(pendingFilters.dateTo);

    return range;
  }, [pendingFilters.dateFrom, pendingFilters.dateTo]);

  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    if (!range || (range.from && range.to)) {
      const dateFrom = range?.from ? formatDateForInput(range.from) : "";
      const dateTo = range?.to ? formatDateForInput(range.to) : "";

      setPendingFilters((prev) => ({
        ...prev,
        dateFrom,
        dateTo,
      }));
    }
  }, []);

  const applyFilters = useCallback(() => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      const currentPageSize = params.get("pageSize");

      params.delete("type");
      params.delete("dateFrom");
      params.delete("dateTo");
      params.delete("amountMin");
      params.delete("amountMax");
      params.delete("categoryIds");
      params.delete("propertyId");
      params.delete("sortBy");
      params.delete("sortOrder");
      params.delete("page");

      if (pendingFilters.type && pendingFilters.type !== "all") params.set("type", pendingFilters.type);
      if (pendingFilters.dateFrom) params.set("dateFrom", pendingFilters.dateFrom);
      if (pendingFilters.dateTo) params.set("dateTo", pendingFilters.dateTo);
      if (pendingFilters.amountMin) params.set("amountMin", pendingFilters.amountMin);
      if (pendingFilters.amountMax) params.set("amountMax", pendingFilters.amountMax);
      if (pendingFilters.categoryIds.length > 0) params.set("categoryIds", pendingFilters.categoryIds.join(","));
      if (pendingFilters.propertyId && pendingFilters.propertyId !== "all") params.set("propertyId", pendingFilters.propertyId);
      if (pendingFilters.sortBy) params.set("sortBy", pendingFilters.sortBy);
      if (pendingFilters.sortOrder) params.set("sortOrder", pendingFilters.sortOrder);

      if (currentPageSize) params.set("pageSize", currentPageSize);

      router.push(`/dashboard/transactions?${params.toString()}`);
      queryClient.invalidateQueries({ queryKey: TRANSACTION_QUERY_KEYS.lists() });
    });
  }, [pendingFilters, router, searchParams, queryClient]);

  const clearAllFilters = useCallback(() => {
    setPendingFilters(DEFAULT_FILTER_VALUES);

    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      const currentPageSize = params.get("pageSize");

      const newParams = new URLSearchParams();
      newParams.set("sortBy", "transactionDate");
      newParams.set("sortOrder", "desc");
      if (currentPageSize) newParams.set("pageSize", currentPageSize);

      router.push(`/dashboard/transactions?${newParams.toString()}`);
      queryClient.invalidateQueries({ queryKey: TRANSACTION_QUERY_KEYS.lists() });
    });
  }, [router, searchParams, queryClient]);

  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    if (pendingFilters.dateFrom || pendingFilters.dateTo) count++;
    if (pendingFilters.type && pendingFilters.type !== "all") count++;
    if (pendingFilters.amountMin || pendingFilters.amountMax) count++;
    if (pendingFilters.categoryIds.length > 0) count++;
    if (showPropertyFilter && pendingFilters.propertyId !== "all") count++;

    return count;
  }, [pendingFilters, showPropertyFilter]);

  return {
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
  };
}
