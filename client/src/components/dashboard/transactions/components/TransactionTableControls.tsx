"use client";

import { Table } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Transaction } from "@/types/transactions";
import { ColumnSelector } from "../ColumnSelector";

interface TransactionTableControlsProps {
  table: Table<Transaction>;
  selectedCount: number;
  totalCount: number;
  onBulkDelete?: () => void;
  onClearSelection: () => void;
  showBulkDelete: boolean;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  showPropertyColumn: boolean;
  loading?: boolean;
}

export function TransactionTableControls({
  table,
  selectedCount,
  totalCount,
  onBulkDelete,
  onClearSelection,
  showBulkDelete,
  globalFilter,
  onGlobalFilterChange,
  showPropertyColumn,
  loading = false,
}: TransactionTableControlsProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1">
        <Input
          placeholder="Search transactions..."
          value={globalFilter}
          onChange={(event) => onGlobalFilterChange(event.target.value)}
          className="max-w-sm"
        />
        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedCount} of {totalCount} row(s) selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
            >
              Clear selection
            </Button>
            {showBulkDelete && onBulkDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onBulkDelete}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedCount})
              </Button>
            )}
          </div>
        )}
      </div>
      <ColumnSelector
        table={table}
        excludeColumns={showPropertyColumn ? [] : ["property"]}
      />
    </div>
  );
}
