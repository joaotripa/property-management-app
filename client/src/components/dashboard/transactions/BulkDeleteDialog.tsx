"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Trash2, AlertTriangle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Transaction, TransactionType } from "@/types/transactions";
import { formatCurrency } from "@/lib/utils/formatting";
import { cn } from "@/lib/utils";

interface BulkDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (transactions: Transaction[]) => Promise<void>;
  transactions: Transaction[];
  loading?: boolean;
}

export function BulkDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  transactions,
  loading = false,
}: BulkDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm(transactions);
      onClose();
    } catch (error) {
      console.error("Failed to delete transactions:", error);
      // Error handling is done in parent component
    } finally {
      setIsDeleting(false);
    }
  };

  const totalAmount = transactions.reduce((sum, transaction) => {
    return sum + (transaction.type === TransactionType.INCOME ? transaction.amount : -transaction.amount);
  }, 0);

  const incomeCount = transactions.filter(t => t.type === TransactionType.INCOME).length;
  const expenseCount = transactions.filter(t => t.type === TransactionType.EXPENSE).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete {transactions.length} Transaction{transactions.length !== 1 ? 's' : ''}
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. The selected transactions will be permanently removed.
          </DialogDescription>
        </DialogHeader>

        {/* Summary Section */}
        <div className="flex-shrink-0 bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total transactions:</span>
            <span className="font-semibold">{transactions.length}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Net amount impact:</span>
            <span className={cn(
              "font-semibold",
              totalAmount >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {totalAmount >= 0 ? "+" : ""}{formatCurrency(totalAmount)}
            </span>
          </div>

          <div className="flex gap-4">
            {incomeCount > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="default">{incomeCount} Income</Badge>
              </div>
            )}
            {expenseCount > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="destructive">{expenseCount} Expense</Badge>
              </div>
            )}
          </div>
        </div>

        {/* Transaction List */}
        <div className="flex-1 min-h-0">
          <h4 className="font-medium mb-2">Transactions to be deleted:</h4>
          <ScrollArea className="h-full border rounded-md">
            <div className="p-4 space-y-2">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-background border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={transaction.type === TransactionType.INCOME ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {transaction.type}
                      </Badge>
                      <span className="font-medium">
                        {transaction.description || "No description"}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {transaction.property?.name} • {transaction.category?.name || "Uncategorized"}
                      {" • "}
                      {format(new Date(transaction.transactionDate), "MMM dd, yyyy")}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={cn(
                      "font-semibold",
                      transaction.type === TransactionType.INCOME ? "text-green-600" : "text-red-600"
                    )}>
                      {transaction.type === TransactionType.INCOME ? "+" : "-"}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting || loading}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting || loading}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete {transactions.length} Transaction{transactions.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}