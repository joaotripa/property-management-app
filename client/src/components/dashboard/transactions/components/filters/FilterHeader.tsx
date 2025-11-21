"use client";

import { Filter, X, ChevronDown, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardTitle } from "@/components/ui/card";

interface FilterHeaderProps {
  activeFiltersCount: number;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
  disabled?: boolean;
}

export function FilterHeader({
  activeFiltersCount,
  isExpanded,
  onToggleExpanded,
  onClearFilters,
  onApplyFilters,
  disabled = false,
}: FilterHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <CardTitle className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        Filters
        {activeFiltersCount > 0 && (
          <Badge
            variant="secondary"
            className="ml-2 bg-primary text-background"
          >
            {activeFiltersCount}
          </Badge>
        )}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 px-2 ml-2"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </CardTitle>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={onApplyFilters}
          className="h-8 px-4"
          disabled={disabled}
        >
          <Search className="h-4 w-4" />
          Apply
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleExpanded}
          className="h-8 px-2"
        >
          {isExpanded ? <ChevronDown /> : <ChevronRight />}
        </Button>
      </div>
    </div>
  );
}
