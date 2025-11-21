"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Transaction, TransactionType } from "@/types/transactions";
import { cn } from "@/lib/utils/index";
import { formatCurrency } from "@/lib/utils/formatting";
import { formatDateForUser } from "@/lib/utils/timezone";
import { TransactionActions } from "../components/table/TransactionActions";

interface GetColumnsProps {
  showPropertyColumn?: boolean;
  showSelection?: boolean;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  timezone: string;
  currencyCode: string;
}

export function getTransactionColumns({
  showPropertyColumn = true,
  showSelection = true,
  onEdit,
  onDelete,
  timezone,
  currencyCode,
}: GetColumnsProps): ColumnDef<Transaction>[] {
  const columns: ColumnDef<Transaction>[] = [];

  // Conditionally add row selection column
  if (showSelection) {
    columns.push({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    });
  }

  // Amount column
  columns.push({
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 hover:bg-transparent hover:text-foreground"
      >
        Amount
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      const type = row.getValue("type") as TransactionType;
      return (
        <span
          className={cn(
            "font-medium tabular-nums",
            type === TransactionType.INCOME
              ? "text-success"
              : "text-destructive"
          )}
        >
          {type === TransactionType.INCOME ? "+" : "-"}
          {formatCurrency(Math.abs(amount), currencyCode)}
        </span>
      );
    },
    enableSorting: true,
    sortingFn: "alphanumeric",
  });

  // Type column
  columns.push({
    accessorKey: "type",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 hover:bg-transparent hover:text-foreground"
      >
        Type
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const type = row.getValue("type") as TransactionType;
      return (
        <Badge
          variant={type === TransactionType.INCOME ? "default" : "destructive"}
        >
          {type}
        </Badge>
      );
    },
    enableSorting: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  });

  // Description column
  columns.push({
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return (
        <div className="max-w-[200px] truncate" title={description}>
          {description || "—"}
        </div>
      );
    },
    enableSorting: false,
  });

  // Date column
  columns.push({
    accessorKey: "transactionDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 hover:bg-transparent hover:text-foreground"
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue("transactionDate") as Date;
      return (
        <span>{formatDateForUser(new Date(date), timezone, "medium")}</span>
      );
    },
    enableSorting: true,
    sortingFn: "datetime",
  });

  // Category column
  columns.push({
    accessorKey: "category",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 hover:bg-transparent hover:text-foreground"
      >
        Category
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const transaction = row.original;
      return <span>{transaction.category?.name || "Uncategorized"}</span>;
    },
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.category?.name || "Uncategorized";
      const b = rowB.original.category?.name || "Uncategorized";
      return a.localeCompare(b);
    },
    filterFn: (row, id, value) => {
      const categoryName = row.original.category?.name || "Uncategorized";
      return value.includes(categoryName);
    },
  });

  // Conditionally add property column
  if (showPropertyColumn) {
    columns.push({
      accessorKey: "property",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 hover:bg-transparent hover:text-foreground"
        >
          Property
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const property = row.getValue("property") as Transaction["property"];
        return (
          <div className="max-w-[150px] truncate" title={property?.name}>
            {property?.name || "Unknown"}
          </div>
        );
      },
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.property?.name || "Unknown";
        const b = rowB.original.property?.name || "Unknown";
        return a.localeCompare(b);
      },
      filterFn: (row, id, value) => {
        const propertyName = row.original.property?.name || "Unknown";
        return value.includes(propertyName);
      },
    });
  }

  // Actions column (always last)
  if (onEdit || onDelete) {
    columns.push({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <TransactionActions
          transaction={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 70,
    });
  }

  return columns;
}

// Column visibility options for the column selector
export const COLUMN_VISIBILITY_OPTIONS = [
  { id: "amount", label: "Amount" },
  { id: "type", label: "Type" },
  { id: "description", label: "Description" },
  { id: "transactionDate", label: "Date" },
  { id: "category", label: "Category" },
  { id: "property", label: "Property" },
] as const;

// Default column visibility state
export const DEFAULT_COLUMN_VISIBILITY = {
  select: true,
  amount: true,
  type: true,
  description: true,
  transactionDate: true,
  category: true,
  property: true,
  actions: true,
};
