"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TransactionForm } from "./TransactionForm";
import { CategoryOption, PropertyOption } from "@/types/transactions";
import { TransactionFormOutput } from "@/lib/validations/transaction";
import { trackEvent } from "@/lib/analytics/tracker";
import { TRANSACTION_EVENTS } from "@/lib/analytics/events";
import { useSession } from "next-auth/react";
import { useCreateTransaction } from "@/hooks/queries/useTransactionQueries";

interface TransactionCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  properties: PropertyOption[];
  categories: CategoryOption[];
}

export function TransactionCreateDialog({
  isOpen,
  onClose,
  properties,
  categories,
}: TransactionCreateDialogProps) {
  const { data: session } = useSession();
  const createTransactionMutation = useCreateTransaction();

  const handleSubmit = async (data: TransactionFormOutput) => {
    try {
      await createTransactionMutation.mutateAsync(data);

      const userId = session?.user?.id;
      const storageKey = `first_transaction_created_${userId}`;
      const isFirstTransaction = userId
        ? !localStorage.getItem(storageKey)
        : false;

      trackEvent(TRANSACTION_EVENTS.TRANSACTION_CREATED, {
        type: data.type,
        has_receipt: false,
        is_first: isFirstTransaction,
      });

      if (isFirstTransaction && userId) {
        localStorage.setItem(storageKey, "true");
      }

      onClose();
    } catch {
      // Error handling is done in the mutation hook
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !createTransactionMutation.isPending) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[90vw] lg:max-w-[80vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Transaction</DialogTitle>
        </DialogHeader>
        <TransactionForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          properties={properties}
          categories={categories}
          isSubmitting={createTransactionMutation.isPending}
          submitButtonText="Create Transaction"
        />
      </DialogContent>
    </Dialog>
  );
}
