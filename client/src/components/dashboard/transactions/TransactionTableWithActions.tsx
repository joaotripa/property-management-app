"use client";

import { format } from "date-fns";
import { Edit, Trash2, MoreVertical } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Transaction } from "@/types/transactions";
import { TransactionType } from "@/types/transactions";
import { TransactionTableSkeleton } from "./TransactionTableSkeleton";
import { cn } from "@/lib/utils/index";

interface TransactionTableWithActionsProps {
  transactions: Transaction[];
  loading?: boolean;
  showPropertyColumn?: boolean;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  emptyMessage?: string;
  className?: string;
}

export function TransactionTableWithActions({
  transactions,
  loading = false,
  showPropertyColumn = true,
  onEdit,
  onDelete,
  emptyMessage = "No transactions found",
  className,
}: TransactionTableWithActionsProps) {
  if (loading) {
    return (
      <TransactionTableSkeleton
        showPropertyColumn={showPropertyColumn}
        className={className}
      />
    );
  }

  if (!transactions.length) {
    return (
      <div className={cn("rounded-lg border", className)}>
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      </div>
    );
  }

  const formatAmount = (amount: number, type: TransactionType) => (
    <span
      className={cn(
        "font-medium",
        type === TransactionType.INCOME ? "text-green-600" : "text-red-600"
      )}
    >
      {type === TransactionType.INCOME ? "+" : "-"}€
      {Math.abs(amount).toFixed(2)}
    </span>
  );

  return (
    <div className={cn("rounded-lg border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Amount</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            {showPropertyColumn && <TableHead>Property</TableHead>}
            {(onEdit || onDelete) && (
              <TableHead className="w-[70px]">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>
                {formatAmount(transaction.amount, transaction.type)}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    transaction.type === TransactionType.INCOME
                      ? "default"
                      : "destructive"
                  }
                >
                  {transaction.type}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {transaction.description || "—"}
              </TableCell>
              <TableCell>
                {format(new Date(transaction.transactionDate), "MMM dd, yyyy")}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {transaction.isRecurring && (
                    <Badge variant="outline" className="text-xs">
                      Recurring
                    </Badge>
                  )}
                  <span>{transaction.category?.name || "Uncategorized"}</span>
                </div>
              </TableCell>
              {showPropertyColumn && (
                <TableCell className="max-w-[150px] truncate">
                  {transaction.property?.name || "Unknown"}
                </TableCell>
              )}
              {(onEdit || onDelete) && (
                <TableCell>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEdit && (
                        <DropdownMenuItem
                          onSelect={() => onEdit(transaction)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4 hover:text-background" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem
                          onSelect={() => onDelete(transaction)}
                          className="cursor-pointer text-destructive focus:text-destructive-foreground"
                        >
                          <Trash2 className="mr-2 h-4 w-4 hover:text-background" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
