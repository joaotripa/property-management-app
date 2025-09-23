"use client";

import * as React from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  subDays,
} from "date-fns";
import { CalendarIcon, X, Check } from "lucide-react";
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
  const [tempRange, setTempRange] = React.useState<DateRange | undefined>(
    dateRange
  );
  const [selectedPreset, setSelectedPreset] = React.useState<string | null>(
    null
  );
  const [focusedPresetIndex, setFocusedPresetIndex] =
    React.useState<number>(-1);
  const [isMobile, setIsMobile] = React.useState(false);

  // Check if mobile on mount and resize
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Sync tempRange with dateRange when it changes externally
  React.useEffect(() => {
    setTempRange(dateRange);
  }, [dateRange]);

  // Reset focus when popover opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setFocusedPresetIndex(0);
    } else {
      setFocusedPresetIndex(-1);
    }
  }, [isOpen]);

  const handlePresetKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedPresetIndex(Math.min(DATE_PRESETS.length - 1, index + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedPresetIndex(Math.max(0, index - 1));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        handlePresetSelect(DATE_PRESETS[index]);
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return placeholder;
    if (!range.to) return format(range.from, "MMM d, y");
    if (range.from.getTime() === range.to.getTime()) {
      return format(range.from, "MMM d, y");
    }
    return `${format(range.from, "MMM d, y")} - ${format(range.to, "MMM d, y")}`;
  };

  const handlePresetSelect = (preset: (typeof DATE_PRESETS)[0]) => {
    const range = preset.getValue();
    setTempRange(range);
    setSelectedPreset(preset.label);
  };

  const handleApply = () => {
    onDateRangeChange?.(tempRange);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempRange(dateRange);
    setSelectedPreset(null);
    setIsOpen(false);
  };

  const handleClear = () => {
    onDateRangeChange?.(undefined);
    setTempRange(undefined);
    setSelectedPreset(null);
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
          <CalendarIcon className="h-4 w-4" />
          {formatDateRange(dateRange)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col lg:flex-row">
          {/* Presets */}
          <div className="w-full lg:w-48 lg:border-r border-b lg:border-b-0">
            <div className="p-3">
              <div className="text-sm font-medium mb-2">Presets</div>
              <div
                className="grid grid-cols-2 lg:grid-cols-1 gap-1 lg:space-y-1"
                role="listbox"
              >
                {DATE_PRESETS.map((preset, index) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-between h-8 px-2 font-normal text-xs lg:text-sm",
                      selectedPreset === preset.label && "bg-accent",
                      focusedPresetIndex === index && "ring-2 ring-ring"
                    )}
                    onClick={() => handlePresetSelect(preset)}
                    onKeyDown={(e) => handlePresetKeyDown(e, index)}
                    tabIndex={focusedPresetIndex === index ? 0 : -1}
                    role="option"
                    aria-selected={selectedPreset === preset.label}
                  >
                    <span>{preset.label}</span>
                    {selectedPreset === preset.label && (
                      <Check className="h-4 w-4 flex-shrink-0" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="p-3">
            <Calendar
              mode="range"
              selected={tempRange as ReactDayPickerDateRange}
              onSelect={(range) => {
                const newRange = range as DateRange;
                setTempRange(newRange);
                setSelectedPreset(null);
              }}
              numberOfMonths={isMobile ? 1 : 2}
              disabled={disabled}
            />
            <Separator className="my-3" />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
                {(tempRange?.from || tempRange?.to) && (
                  <Button variant="ghost" size="sm" onClick={handleClear}>
                    Clear
                  </Button>
                )}
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={handleApply}
                disabled={!tempRange?.from || !tempRange?.to}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
