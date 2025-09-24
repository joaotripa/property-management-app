"use client";

import { useState } from "react";
import { Table } from "@tanstack/react-table";
import { ChevronDown, Columns2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Transaction } from "@/types/transactions";
import { COLUMN_VISIBILITY_OPTIONS } from "./TransactionColumns";

interface ColumnSelectorProps {
  table: Table<Transaction>;
  excludeColumns?: string[];
}

export function ColumnSelector({ table, excludeColumns = [] }: ColumnSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const availableColumns = COLUMN_VISIBILITY_OPTIONS.filter((option) => {
    if (excludeColumns.includes(option.id)) {
      return false;
    }
    const column = table.getColumn(option.id);
    return column && column.getCanHide();
  });

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 flex items-center gap-2"
        >
          <Columns2 className="h-4 w-4" />
          Columns
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {availableColumns.map((option) => {
          const column = table.getColumn(option.id);

          return (
            <DropdownMenuCheckboxItem
              key={option.id}
              className="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
