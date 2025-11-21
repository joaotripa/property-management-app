"use client";

import { useState, useMemo } from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type RowSelectionState,
} from "@tanstack/react-table";
import { Transaction } from "@/types/transactions";
import { DEFAULT_COLUMN_VISIBILITY } from "../config/transaction-columns";

interface UseTransactionTableProps {
  transactions: Transaction[];
  columns: ColumnDef<Transaction>[];
  maxRows?: number;
  initialGlobalFilter?: string;
  columnVisibilityOverrides?: Record<string, boolean>;
}

export function useTransactionTable({
  transactions,
  columns,
  maxRows,
  initialGlobalFilter = "",
  columnVisibilityOverrides = {},
}: UseTransactionTableProps) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const displayTransactions = useMemo(() => {
    return maxRows ? transactions.slice(0, maxRows) : transactions;
  }, [transactions, maxRows]);

  const initialColumnVisibility = {
    ...DEFAULT_COLUMN_VISIBILITY,
    ...columnVisibilityOverrides,
  };

  const table = useReactTable({
    data: displayTransactions,
    columns,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    initialState: {
      sorting: [],
      columnFilters: [],
      globalFilter: initialGlobalFilter,
      columnVisibility: initialColumnVisibility,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    autoResetPageIndex: false
  });

  return {
    table,
    globalFilter: table.getState().globalFilter ?? "",
    setGlobalFilter: (value: string) => table.setGlobalFilter(value),
    getSelectedTransactions: () =>
      table.getFilteredSelectedRowModel().rows.map((row) => row.original),
  };
}
