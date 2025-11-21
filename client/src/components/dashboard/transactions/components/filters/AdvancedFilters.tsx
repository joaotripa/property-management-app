"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface AdvancedFiltersProps {
  amountMin: string;
  amountMax: string;
  sortBy: string;
  sortOrder: string;
  onAmountMinChange: (value: string) => void;
  onAmountMaxChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
  disabled?: boolean;
}

export function AdvancedFilters({
  amountMin,
  amountMax,
  sortBy,
  sortOrder,
  onAmountMinChange,
  onAmountMaxChange,
  onSortByChange,
  onSortOrderChange,
  disabled = false,
}: AdvancedFiltersProps) {
  return (
    <div className="flex flex-col gap-6 mt-6">
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col gap-2">
          <Label>Min Amount (€)</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={amountMin}
            onChange={(e) => onAmountMinChange(e.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Max Amount (€)</Label>
          <Input
            type="number"
            placeholder="1000.00"
            value={amountMax}
            onChange={(e) => onAmountMaxChange(e.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Sort By</Label>
          <Select value={sortBy} onValueChange={onSortByChange} disabled={disabled}>
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
            value={sortOrder}
            onValueChange={onSortOrderChange}
            disabled={disabled}
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
  );
}
