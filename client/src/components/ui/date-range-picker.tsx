"use client";

import * as React from "react";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subDays } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import type { DateRange as ReactDayPickerDateRange } from "react-day-picker";

export interface DateRange {
  from?: Date;
  to?: Date;
}

interface DateRangePickerProps {
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const DATE_PRESETS = [
  {
    label: "This Month",
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  {
    label: "Last Month",
    getValue: () => ({
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    }),
  },
  {
    label: "Last 30 Days",
    getValue: () => ({
      from: subDays(new Date(), 30),
      to: new Date(),
    }),
  },
  {
    label: "Last 3 Months",
    getValue: () => ({
      from: startOfMonth(subMonths(new Date(), 2)),
      to: endOfMonth(new Date()),
    }),
  },
  {
    label: "This Year",
    getValue: () => ({
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    }),
  },
  {
    label: "Last Year",
    getValue: () => {
      const lastYear = new Date().getFullYear() - 1;
      return {
        from: new Date(lastYear, 0, 1),
        to: new Date(lastYear, 11, 31),
      };
    },
  },
];

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  placeholder = "Pick a date range",
  disabled = false,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return placeholder;
    if (!range.to) return format(range.from, "MMM d, y");
    if (range.from.getTime() === range.to.getTime()) {
      return format(range.from, "MMM d, y");
    }
    return `${format(range.from, "MMM d, y")} - ${format(range.to, "MMM d, y")}`;
  };

  const handlePresetSelect = (preset: typeof DATE_PRESETS[0]) => {
    const range = preset.getValue();
    onDateRangeChange?.(range);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateRangeChange?.(undefined);
  };

  const hasValue = dateRange?.from || dateRange?.to;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !hasValue && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange(dateRange)}
          {hasValue && (
            <X
              className="ml-auto h-4 w-4 opacity-50 hover:opacity-100"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Presets */}
          <div className="w-48 border-r">
            <div className="p-3">
              <div className="text-sm font-medium mb-2">Presets</div>
              <div className="space-y-1">
                {DATE_PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8 px-2 font-normal"
                    onClick={() => handlePresetSelect(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="p-3">
            <Calendar
              mode="range"
              selected={dateRange as ReactDayPickerDateRange}
              onSelect={(range) => {
                onDateRangeChange?.(range as DateRange);
                // Close if both dates are selected
                if (range?.from && range?.to) {
                  setIsOpen(false);
                }
              }}
              numberOfMonths={2}
              disabled={disabled}
              initialFocus
            />

            {hasValue && (
              <>
                <Separator className="my-3" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Selected: {formatDateRange(dateRange)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onDateRangeChange?.(undefined);
                      setIsOpen(false);
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}