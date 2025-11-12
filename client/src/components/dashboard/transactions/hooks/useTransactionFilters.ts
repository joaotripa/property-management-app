"use client";

import { useState, useTransition, useCallback, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DateRange } from "@/components/ui/date-range-picker";
import { formatDateForInput } from "@/lib/utils/timezone";

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

interface UseTransactionFiltersProps {
  showPropertyFilter?: boolean;
}

export function useTransactionFilters({ showPropertyFilter = false }: UseTransactionFiltersProps = {}) {
  const [isPending, startTransition] = useTransition();
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentFilters = useMemo<FilterValues>(() => ({
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
  }), [searchParams]);

  const [pendingFilters, setPendingFilters] = useState<FilterValues>(currentFilters);
  const [hasChanges, setHasChanges] = useState(false);

  const dateRange = useMemo<DateRange | undefined>(() => {
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    if (!dateFrom && !dateTo) return undefined;

    const range: DateRange = {};
    if (dateFrom) range.from = new Date(dateFrom);
    if (dateTo) range.to = new Date(dateTo);

    return range;
  }, [searchParams]);

  useEffect(() => {
    setPendingFilters(currentFilters);
    setHasChanges(false);
  }, [currentFilters]);

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

  const handleFilterChange = useCallback((key: string, value: string | undefined) => {
    setPendingFilters((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
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
    setHasChanges(true);
  }, []);

  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    if (!range || (range.from && range.to)) {
      setPendingFilters((prev) => ({
        ...prev,
        dateFrom: range?.from ? formatDateForInput(range.from) : "",
        dateTo: range?.to ? formatDateForInput(range.to) : "",
      }));
      setHasChanges(true);
    }
  }, []);

  const applyFilters = useCallback(() => {
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
  }, [pendingFilters, updateURL]);

  const clearAllFilters = useCallback(() => {
    const defaultFilters: FilterValues = {
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

    setPendingFilters(defaultFilters);

    startTransition(() => {
      router.push(
        "/dashboard/transactions?sortBy=transactionDate&sortOrder=desc"
      );
      setHasChanges(false);
    });
  }, [router]);

  const getActiveFiltersCount = useCallback(() => {
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
  }, [currentFilters, pendingFilters, hasChanges, showPropertyFilter]);

  return {
    isPending,
    isExpanded,
    setIsExpanded,
    currentFilters,
    pendingFilters,
    hasChanges,
    dateRange,
    handleFilterChange,
    toggleCategory,
    handleDateRangeChange,
    applyFilters,
    clearAllFilters,
    getActiveFiltersCount,
  };
}
