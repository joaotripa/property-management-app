"use client";

import { useState, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Transaction, TransactionType } from "@/types/transactions";
import { formatCurrency } from "@/lib/utils/formatting";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { deleteTransaction } from "@/lib/services/client/transactionsService";

interface TransactionDeleteDialogProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onTransactionDeleted: () => void;
}

export function TransactionDeleteDialog({
  transaction,
  isOpen,
  onClose,
  onTransactionDeleted,
}: TransactionDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = useCallback(async () => {
    if (!transaction) return;

    try {
      setIsDeleting(true);
      await deleteTransaction(transaction.id);
      toast.success("Transaction deleted successfully");
      onTransactionDeleted();
      onClose();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete transaction"
      );
    } finally {
      setIsDeleting(false);
    }
  }, [transaction, onTransactionDeleted, onClose]);

  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Transaction
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. The transaction will be permanently
            removed.
          </DialogDescription>
        </DialogHeader>

        {/* Summary Section */}
        <div className="flex-shrink-0 bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Transaction amount:</span>
            <span
              className={cn(
                "font-semibold",
                transaction.type === TransactionType.INCOME
                  ? "text-green-600"
                  : "text-red-600"
              )}
            >
              {transaction.type === TransactionType.INCOME ? "+" : "-"}
              {formatCurrency(Math.abs(transaction.amount))}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Transaction type:</span>
            <Badge
              variant={
                transaction.type === TransactionType.INCOME
                  ? "default"
                  : "destructive"
              }
              className="text-xs"
            >
              {transaction.type}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Date:</span>
            <span className="font-medium">
              {format(new Date(transaction.transactionDate), "MMM dd, yyyy")}
            </span>
          </div>

          {transaction.description && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Description:</span>
              <span
                className="font-medium max-w-[200px] truncate text-right"
                title={transaction.description}
              >
                {transaction.description}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Property:</span>
            <span className="font-medium">
              {transaction.property?.name || "Unknown"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Category:</span>
            <span className="font-medium">
              {transaction.category?.name || "Uncategorized"}
            </span>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Transaction
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
