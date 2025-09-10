"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TransactionForm } from "./TransactionForm";
import {
  Transaction,
  CategoryOption,
  PropertyOption,
} from "@/types/transactions";
import { toast } from "sonner";
import { format } from "date-fns";
import { updateTransaction } from "@/lib/services/transactionsService";
import { TransactionFormOutput } from "@/lib/validations/transaction";
import { TransactionType } from "@prisma/client";

interface TransactionEditDialogProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onTransactionUpdated: () => void;
  properties: PropertyOption[];
  categories: CategoryOption[];
}

export function TransactionEditDialog({
  transaction,
  isOpen,
  onClose,
  onTransactionUpdated,
  properties,
  categories,
}: TransactionEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!transaction) return null;

  const defaultValues = transaction
    ? {
        amount: transaction.amount.toString(),
        type: transaction.type,
        description: transaction.description || "",
        transactionDate: format(
          new Date(transaction.transactionDate),
          "yyyy-MM-dd"
        ),
        isRecurring: transaction.isRecurring,
        propertyId: transaction.propertyId,
        categoryId: transaction.categoryId,
      }
    : {
        amount: "",
        type: TransactionType.EXPENSE,
        description: "",
        transactionDate: format(new Date(), "yyyy-MM-dd"),
        isRecurring: false,
        propertyId: "",
        categoryId: "",
      };

  const handleSubmit = async (data: TransactionFormOutput) => {
    setIsSubmitting(true);
    try {
      await updateTransaction(transaction.id, data);
      toast.success("Transaction updated successfully");
      onTransactionUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update transaction"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[90vw] lg:max-w-[80vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        <TransactionForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={onClose}
          properties={properties}
          categories={categories}
          isSubmitting={isSubmitting}
          submitButtonText="Update Transaction"
        />
      </DialogContent>
    </Dialog>
  );
}
