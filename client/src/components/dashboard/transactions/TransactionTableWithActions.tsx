"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Transaction } from "@/types/transactions";
import { TransactionTableSkeleton } from "./TransactionTableSkeleton";
import { ColumnSelector } from "./ColumnSelector";
import {
  getTransactionColumns,
  DEFAULT_COLUMN_VISIBILITY,
} from "./TransactionColumns";
import { cn } from "@/lib/utils/index";
import { BulkDeleteDialog } from "./BulkDeleteDialog";
import { Trash2 } from "lucide-react";

interface TransactionTableWithActionsProps {
  transactions: Transaction[];
  loading?: boolean;
  showPropertyColumn?: boolean;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  onBulkDelete?: (transactions: Transaction[]) => Promise<void>;
  emptyMessage?: string;
  className?: string;
  readOnly?: boolean;
  maxRows?: number;
  showSelection?: boolean;
}

const COLUMN_VISIBILITY_KEY = "transaction-table-column-visibility";

export function TransactionTableWithActions({
  transactions,
  loading = false,
  showPropertyColumn = true,
  onEdit,
  onDelete,
  onBulkDelete,
  emptyMessage = "No transactions found",
  className,
  readOnly = false,
  maxRows,
  showSelection,
}: TransactionTableWithActionsProps) {
  const searchParams = useSearchParams();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(COLUMN_VISIBILITY_KEY);
        if (saved) {
          try {
            return JSON.parse(saved);
          } catch {
            return DEFAULT_COLUMN_VISIBILITY;
          }
        }
      }
      return DEFAULT_COLUMN_VISIBILITY;
    }
  );
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        COLUMN_VISIBILITY_KEY,
        JSON.stringify(columnVisibility)
      );
    }
  }, [columnVisibility]);

  useEffect(() => {
    setColumnVisibility((prev) => ({
      ...prev,
      property: showPropertyColumn,
    }));
  }, [showPropertyColumn]);

  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    setGlobalFilter(urlSearch);
  }, [searchParams]);

  const handleGlobalFilterChange = (value: string) => {
    setGlobalFilter(value);
  };

  const getSelectedTransactions = (): Transaction[] => {
    return table.getFilteredSelectedRowModel().rows.map((row) => row.original);
  };

  const handleBulkDelete = async (selectedTransactions: Transaction[]) => {
    if (!onBulkDelete) return;

    try {
      await onBulkDelete(selectedTransactions);
      setRowSelection({});
    } catch (error) {
      console.error("Bulk delete failed:", error);
    }
  };

  // Default showSelection based on readOnly state if not explicitly set
  const shouldShowSelection = showSelection ?? !readOnly;

  const columns = getTransactionColumns({
    showPropertyColumn,
    showSelection: shouldShowSelection,
    onEdit: readOnly ? undefined : onEdit,
    onDelete: readOnly ? undefined : onDelete,
  });

  // Limit transactions if maxRows is specified
  const displayTransactions = maxRows ? transactions.slice(0, maxRows) : transactions;

  const table = useReactTable({
    data: displayTransactions,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: handleGlobalFilterChange,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    globalFilterFn: "includesString",
  });

  if (loading) {
    return (
      <TransactionTableSkeleton
        showPropertyColumn={showPropertyColumn}
        className={className}
      />
    );
  }

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;
  const totalRowsCount = table.getFilteredRowModel().rows.length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Table controls - only show in non-read-only mode */}
      {!readOnly && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Input
              placeholder="Search transactions..."
              value={globalFilter}
              onChange={(event) => handleGlobalFilterChange(event.target.value)}
              className="max-w-sm"
            />
            {selectedRowsCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedRowsCount} of {totalRowsCount} row(s) selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRowSelection({})}
                >
                  Clear selection
                </Button>
                {onBulkDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowBulkDeleteDialog(true)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected ({selectedRowsCount})
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
      )}

      {/* Table */}
      <div className="rounded-lg border">
        {!transactions.length ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{
                        width:
                          header.getSize() !== 150
                            ? header.getSize()
                            : undefined,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Bulk Delete Dialog - only show in non-read-only mode */}
      {!readOnly && (
        <BulkDeleteDialog
          isOpen={showBulkDeleteDialog}
          onClose={() => setShowBulkDeleteDialog(false)}
          onConfirm={handleBulkDelete}
          transactions={getSelectedTransactions()}
          loading={loading}
        />
      )}
    </div>
  );
}
