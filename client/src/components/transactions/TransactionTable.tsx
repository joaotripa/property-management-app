"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Transaction, TransactionTableProps } from "@/types/transactions";
import { TransactionType } from "@prisma/client";
import { TransactionTableSkeleton } from "./TransactionTableSkeleton";
import { cn } from "@/lib/utils";

export function TransactionTable({
  transactions,
  loading = false,
  showPropertyColumn = false,
  onSort,
  sortConfig,
  emptyMessage = "No transactions found",
  className,
}: TransactionTableProps) {
  const [localSortConfig, setLocalSortConfig] = useState<{
    column: keyof Transaction;
    direction: "asc" | "desc";
  }>({ column: "transactionDate", direction: "desc" });

  const effectiveSortConfig = sortConfig || localSortConfig;

  const handleSort = (column: keyof Transaction) => {
    const newDirection: "asc" | "desc" =
      effectiveSortConfig.column === column &&
      effectiveSortConfig.direction === "asc"
        ? "desc"
        : "asc";

    const newSortConfig: {
      column: keyof Transaction;
      direction: "asc" | "desc";
    } = { column, direction: newDirection };

    if (onSort) {
      onSort(column, newDirection);
    } else {
      setLocalSortConfig(newSortConfig);
    }
  };

  const formatAmount = (amount: number, type: TransactionType) => {
    const formatted = `€${Math.abs(amount).toFixed(2)}`;
    return (
      <span
        className={cn(
          "font-medium",
          type === TransactionType.INCOME
            ? "text-success dark:text-success/80"
            : "text-destructive dark:text-destructive/80"
        )}
      >
        {type === TransactionType.INCOME ? "+" : "-"}
        {formatted}
      </span>
    );
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), "MMM dd, yyyy");
  };

  const getTypeVariant = (type: TransactionType) => {
    return type === TransactionType.INCOME ? "default" : "secondary";
  };

  const getSortIcon = (column: keyof Transaction) => {
    if (effectiveSortConfig.column !== column) {
      return <ArrowUpDown className="ml-1 h-4 w-4" />;
    }
    return effectiveSortConfig.direction === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  const SortableHeader = ({
    column,
    children,
    className: headerClassName,
  }: {
    column: keyof Transaction;
    children: React.ReactNode;
    className?: string;
  }) => (
    <TableHead className={headerClassName}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent"
        onClick={() => handleSort(column)}
      >
        {children}
        {getSortIcon(column)}
      </Button>
    </TableHead>
  );

  if (loading) {
    return (
      <TransactionTableSkeleton
        showPropertyColumn={showPropertyColumn}
        className={className}
        rowCount={5}
      />
    );
  }

  if (!transactions.length) {
    return (
      <div className={cn("rounded-md border", className)}>
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      </div>
    );
  }

  // Sort transactions locally if no external sorting is provided
  const sortedTransactions = onSort
    ? transactions
    : [...transactions].sort((a, b) => {
        const aValue = a[effectiveSortConfig.column];
        const bValue = b[effectiveSortConfig.column];

        if (aValue == null || bValue == null) return 0;
        if (aValue === bValue) return 0;

        const comparison =
          (aValue as string | number | Date) <
          (bValue as string | number | Date)
            ? -1
            : 1;
        return effectiveSortConfig.direction === "asc"
          ? comparison
          : -comparison;
      });

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader column="amount">Amount</SortableHeader>
            <SortableHeader column="type">Type</SortableHeader>
            <TableHead>Description</TableHead>
            <SortableHeader column="transactionDate">Date</SortableHeader>
            <TableHead>Recurring</TableHead>
            <TableHead>Category</TableHead>
            {showPropertyColumn && <TableHead>Property</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTransactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">
                {formatAmount(transaction.amount, transaction.type)}
              </TableCell>
              <TableCell>
                <Badge variant={getTypeVariant(transaction.type)}>
                  {transaction.type}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {transaction.description || "—"}
              </TableCell>
              <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
              <TableCell>
                {transaction.isRecurring ? (
                  <Badge variant="outline" className="text-xs">
                    Recurring
                  </Badge>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {transaction.category?.name || "Uncategorized"}
                </span>
              </TableCell>
              {showPropertyColumn && (
                <TableCell className="max-w-[150px] truncate">
                  {transaction.property?.name || "Unknown Property"}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
