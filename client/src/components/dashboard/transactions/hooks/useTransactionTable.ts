"use client";

import { useState, useMemo } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Transaction } from "@/types/transactions";
import { useTransactionTableStore, DEFAULT_COLUMN_VISIBILITY } from "../stores/transaction-table-store";

interface UseTransactionTableProps {
  transactions: Transaction[];
  columns: ColumnDef<Transaction>[];
  showPropertyColumn: boolean;
  maxRows?: number;
  initialGlobalFilter?: string;
}

export function useTransactionTable({
  transactions,
  columns,
  showPropertyColumn,
  maxRows,
  initialGlobalFilter = "",
}: UseTransactionTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState(initialGlobalFilter);

  const store = useTransactionTableStore();
  const hasHydrated = store._hasHydrated;

  const effectiveColumnVisibility = hasHydrated
    ? store.columnVisibility
    : DEFAULT_COLUMN_VISIBILITY;

  const handleGlobalFilterChange = (value: string) => {
    setGlobalFilter(value);
  };

  const displayTransactions = useMemo(() => {
    return maxRows ? transactions.slice(0, maxRows) : transactions;
  }, [transactions, maxRows]);

  const existingColumnIds = useMemo(() => {
    return new Set(
      columns.map((col) => col.id || (col as { accessorKey?: string }).accessorKey)
    );
  }, [columns]);

  const tableColumnVisibility = useMemo(() => {
    const withPropertyColumn = {
      ...effectiveColumnVisibility,
      property: showPropertyColumn,
    };

    return Object.fromEntries(
      Object.entries(withPropertyColumn).filter(([key]) =>
        existingColumnIds.has(key)
      )
    );
  }, [effectiveColumnVisibility, showPropertyColumn, existingColumnIds]);

  const table = useReactTable({
    data: displayTransactions,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: store.setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: handleGlobalFilterChange,
    state: {
      sorting,
      columnFilters,
      columnVisibility: tableColumnVisibility,
      rowSelection,
      globalFilter,
    },
    globalFilterFn: "includesString",
  });

  const getSelectedTransactions = (): Transaction[] => {
    return table.getFilteredSelectedRowModel().rows.map((row) => row.original);
  };

  return {
    table,
    sorting,
    columnFilters,
    rowSelection,
    globalFilter,
    handleGlobalFilterChange,
    getSelectedTransactions,
    setRowSelection,
  };
}
