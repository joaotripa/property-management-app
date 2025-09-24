"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { TIME_RANGES } from "@/lib/utils/dateRange";

interface TimeRangeSelectorProps {
  defaultValue?: string;
}

export function TimeRangeSelector({
  defaultValue = "semester",
}: TimeRangeSelectorProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentTimeRange = searchParams.get("timeRange") || defaultValue;

  const handleTimeRangeChange = (value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);

      if (value === defaultValue) {
        params.delete("timeRange");
      } else {
        params.set("timeRange", value);
      }

      router.push(`/dashboard/analytics?${params.toString()}`, {
        scroll: false,
      });
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentTimeRange}
        onValueChange={handleTimeRangeChange}
        disabled={isPending}
      >
        <SelectTrigger
          className={`w-36 sm:w-40 h-8 ${isPending ? "opacity-70" : ""}`}
        >
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          {TIME_RANGES.map((range) => (
            <SelectItem key={range.value} value={range.value}>
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      )}
    </div>
  );
}
