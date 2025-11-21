"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TransactionForm } from "../forms/TransactionForm";
import {
  Transaction,
  CategoryOption,
  PropertyOption,
} from "@/types/transactions";
import { format } from "date-fns";
import { TransactionFormOutput } from "@/lib/validations/transaction";
import { TransactionType } from "@/types/transactions";
import { useUpdateTransaction } from "@/hooks/queries/useTransactionQueries";

interface TransactionEditDialogProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  properties: PropertyOption[];
  categories: CategoryOption[];
}

export function TransactionEditDialog({
  transaction,
  isOpen,
  onClose,
  properties,
  categories,
}: TransactionEditDialogProps) {
  const updateTransactionMutation = useUpdateTransaction();

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
    try {
      await updateTransactionMutation.mutateAsync({
        id: transaction.id,
        data,
      });
      onClose();
    } catch {
      // Error handling is done in the mutation hook
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !updateTransactionMutation.isPending) {
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
          isSubmitting={updateTransactionMutation.isPending}
          submitButtonText="Update Transaction"
        />
      </DialogContent>
    </Dialog>
  );
}
