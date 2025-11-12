"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionType } from "@/types/transactions";
import { toCamelCase } from "@/lib/utils/index";

interface TypeFilterProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function TypeFilter({ value, onChange, disabled = false }: TypeFilterProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
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
  );
}
