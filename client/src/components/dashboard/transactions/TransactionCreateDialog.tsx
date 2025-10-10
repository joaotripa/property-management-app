"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TransactionForm } from "./TransactionForm";
import { CategoryOption, PropertyOption } from "@/types/transactions";
import { toast } from "sonner";
import { createTransaction } from "@/lib/services/client/transactionsService";
import { TransactionFormOutput } from "@/lib/validations/transaction";

interface TransactionCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTransactionCreated: () => void;
  properties: PropertyOption[];
  categories: CategoryOption[];
}

export function TransactionCreateDialog({
  isOpen,
  onClose,
  onTransactionCreated,
  properties,
  categories,
}: TransactionCreateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: TransactionFormOutput) => {
    setIsSubmitting(true);
    try {
      await createTransaction(data);
      toast.success("Transaction created successfully");
      onTransactionCreated();
      onClose();
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create transaction"
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
          <DialogTitle>Create New Transaction</DialogTitle>
        </DialogHeader>
        <TransactionForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          properties={properties}
          categories={categories}
          isSubmitting={isSubmitting}
          submitButtonText="Create Transaction"
        />
      </DialogContent>
    </Dialog>
  );
}
