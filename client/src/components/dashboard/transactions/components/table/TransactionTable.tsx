"use client";

import { useState, useMemo } from "react";
import { Transaction } from "@/types/transactions";
import { TransactionTableSkeleton } from "./TransactionTableSkeleton";
import { TransactionTableControls } from "./TransactionTableControls";
import { TransactionTableBody } from "./TransactionTableBody";
import { BulkDeleteDialog } from "../dialogs/BulkDeleteDialog";
import { getTransactionColumns } from "../../config/transaction-columns";
import { useTransactionTable } from "../../hooks/useTransactionTable";
import { cn } from "@/lib/utils/index";

interface TransactionTableProps {
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
  initialGlobalFilter?: string;
  timezone: string;
  currencyCode: string;
}

export function TransactionTable({
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
  initialGlobalFilter,
  timezone,
  currencyCode,
}: TransactionTableProps) {
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const shouldShowSelection = showSelection ?? !readOnly;

  const columns = useMemo(
    () =>
      getTransactionColumns({
        showPropertyColumn,
        showSelection: shouldShowSelection,
        onEdit: readOnly ? undefined : onEdit,
        onDelete: readOnly ? undefined : onDelete,
        timezone,
        currencyCode,
      }),
    [
      showPropertyColumn,
      shouldShowSelection,
      readOnly,
      onEdit,
      onDelete,
      timezone,
      currencyCode,
    ]
  );

  const {
    table,
    globalFilter,
    setGlobalFilter,
    getSelectedTransactions,
    setRowSelection,
  } = useTransactionTable({
    transactions,
    columns,
    showPropertyColumn,
    maxRows,
    initialGlobalFilter,
  });

  const handleBulkDelete = async (selectedTransactions: Transaction[]) => {
    if (!onBulkDelete) return;

    try {
      await onBulkDelete(selectedTransactions);
      setRowSelection({});
    } catch (error) {
      console.error("Bulk delete failed:", error);
    }
  };

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
      {!readOnly && (
        <TransactionTableControls
          table={table}
          selectedCount={selectedRowsCount}
          totalCount={totalRowsCount}
          onBulkDelete={() => setShowBulkDeleteDialog(true)}
          onClearSelection={() => setRowSelection({})}
          showBulkDelete={!!onBulkDelete}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          showPropertyColumn={showPropertyColumn}
          loading={loading}
        />
      )}

      <TransactionTableBody table={table} emptyMessage={emptyMessage} />

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
