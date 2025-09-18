"use client";

import { useState, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Transaction } from "@/types/transactions";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { deleteTransaction } from "@/lib/services/client/transactionsService";
import { format } from "date-fns";

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

    setIsDeleting(true);
    try {
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

  const handleOpenChange = (open: boolean) => {
    if (!open && !isDeleting) {
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="flex flex-col">
              <span className="text-muted-foreground">
                Are you sure you want to delete this transaction?
              </span>
              <div className="bg-warning/10 p-4 mt-3 rounded-md border-l-4 border-warning w-full text-sm text-warning-foreground">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-medium">
                    {transaction.type === "INCOME" ? "+" : "-"}€
                    {Math.abs(transaction.amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="capitalize">
                    {transaction.type.toLowerCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>
                    {format(
                      new Date(transaction.transactionDate),
                      "MMM dd, yyyy"
                    )}
                  </span>
                </div>
                {transaction.description && (
                  <div className="flex justify-between">
                    <span>Description:</span>
                    <span
                      className="truncate max-w-[150px]"
                      title={transaction.description}
                    >
                      {transaction.description}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Transaction"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
