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
  TransactionType,
} from "@/types/transactions";
import { format } from "date-fns";
import { TransactionFormOutput } from "@/lib/validations/transaction";
import { trackEvent } from "@/lib/analytics/tracker";
import { TRANSACTION_EVENTS } from "@/lib/analytics/events";
import { useSession } from "next-auth/react";
import {
  useCreateTransaction,
  useUpdateTransaction,
} from "@/hooks/queries/useTransactionQueries";

interface TransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  properties: PropertyOption[];
  categories: CategoryOption[];
  transaction?: Transaction | null;
}

export function TransactionDialog({
  isOpen,
  onClose,
  properties,
  categories,
  transaction = null,
}: TransactionDialogProps) {
  const { data: session } = useSession();
  const createTransactionMutation = useCreateTransaction();
  const updateTransactionMutation = useUpdateTransaction();

  const isEditMode = !!transaction;
  const mutation = isEditMode
    ? updateTransactionMutation
    : createTransactionMutation;

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
      if (isEditMode) {
        await updateTransactionMutation.mutateAsync({
          id: transaction.id,
          data,
        });
      } else {
        await createTransactionMutation.mutateAsync(data);

        // Track analytics for new transactions
        const userId = session?.user?.id;
        const storageKey = `first_transaction_created_${userId}`;
        const isFirstTransaction =
          userId && typeof window !== "undefined"
            ? !localStorage.getItem(storageKey)
            : false;

        trackEvent(TRANSACTION_EVENTS.TRANSACTION_CREATED, {
          type: data.type,
          has_receipt: false,
          is_first: isFirstTransaction,
        });

        if (isFirstTransaction && userId && typeof window !== "undefined") {
          localStorage.setItem(storageKey, "true");
        }
      }

      onClose();
    } catch {
      // Error handling is done in the mutation hook
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !mutation.isPending) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[90vw] lg:max-w-[80vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Transaction" : "Create New Transaction"}
          </DialogTitle>
        </DialogHeader>
        <TransactionForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={onClose}
          properties={properties}
          categories={categories}
          isSubmitting={mutation.isPending}
          submitButtonText={
            isEditMode ? "Update Transaction" : "Create Transaction"
          }
        />
      </DialogContent>
    </Dialog>
  );
}
