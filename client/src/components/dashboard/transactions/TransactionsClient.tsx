"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  CategoryOption,
  PropertyOption,
  Transaction,
} from "@/types/transactions";
import { TransactionTableWithActions } from "@/components/dashboard/transactions/TransactionTableWithActions";
import { TransactionsPagination } from "@/components/dashboard/transactions/TransactionsPagination";
import { TransactionCreateDialog } from "@/components/dashboard/transactions/TransactionCreateDialog";
import { TransactionEditDialog } from "@/components/dashboard/transactions/TransactionEditDialog";
import { TransactionDeleteDialog } from "@/components/dashboard/transactions/TransactionDeleteDialog";
import { bulkDeleteTransactions } from "@/lib/services/client/transactionsService";

interface TransactionsClientProps {
  transactions: Transaction[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  categories: CategoryOption[];
  properties: PropertyOption[];
  canMutate: boolean;
}

export function TransactionsClient({
  transactions,
  totalCount,
  totalPages,
  currentPage,
  pageSize,
  categories,
  properties,
  canMutate,
}: TransactionsClientProps) {
  const [dialogType, setDialogType] = useState<"create" | "edit" | "delete" | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const openDialog = (type: "create" | "edit" | "delete", transaction?: Transaction) => {
    setDialogType(type);
    setSelectedTransaction(transaction || null);
  };

  const closeDialog = () => {
    setDialogType(null);
  };

  const handleDataChange = () => {
    // Refresh the page to get updated data
    router.refresh();
  };

  const handlePageChange = (page: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (page === 1) {
        params.delete('page');
      } else {
        params.set('page', page.toString());
      }
      router.push(`?${params.toString()}`);
    });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.delete('page'); // Reset to page 1
      if (newPageSize === 25) {
        params.delete('pageSize');
      } else {
        params.set('pageSize', newPageSize.toString());
      }
      router.push(`?${params.toString()}`);
    });
  };

  const handleBulkDelete = async (selectedTransactions: Transaction[]) => {
    try {
      const transactionIds = selectedTransactions.map(t => t.id);
      const result = await bulkDeleteTransactions(transactionIds);

      // Show success message
      if (result.deletedCount > 0) {
        toast.success(
          `${result.deletedCount} transaction${result.deletedCount !== 1 ? 's' : ''} deleted successfully`
        );
      }

      // Show warning for failed deletions
      if (result.failedCount > 0) {
        toast.warning(
          `${result.failedCount} transaction${result.failedCount !== 1 ? 's' : ''} could not be deleted`
        );
      }

      // Refresh the data
      handleDataChange();
    } catch (error) {
      console.error("Bulk delete failed:", error);
      toast.error("Failed to delete transactions. Please try again.");
      throw error; // Re-throw to let dialog handle loading state
    }
  };

  return (
    <>
      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <TransactionTableWithActions
            transactions={transactions}
            loading={isPending}
            showPropertyColumn={true}
            onEdit={(transaction) => openDialog("edit", transaction)}
            onDelete={(transaction) => openDialog("delete", transaction)}
            onBulkDelete={handleBulkDelete}
            emptyMessage="No transactions found"
            readOnly={!canMutate}
            showSelection={canMutate}
          />

          {/* Pagination */}
          {totalCount > 0 && (
            <TransactionsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              loading={isPending}
            />
          )}
        </CardContent>
      </Card>

      {/* Floating Add Button */}
      {canMutate && (
        <Button
          size="lg"
          onClick={() => openDialog("create")}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full hover:bg-primary/90 shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Dialogs */}
      <TransactionCreateDialog
        isOpen={dialogType === "create"}
        onClose={closeDialog}
        onTransactionCreated={handleDataChange}
        properties={properties}
        categories={categories}
      />

      <TransactionEditDialog
        transaction={selectedTransaction}
        isOpen={dialogType === "edit"}
        onClose={closeDialog}
        onTransactionUpdated={handleDataChange}
        properties={properties}
        categories={categories}
      />

      <TransactionDeleteDialog
        transaction={selectedTransaction}
        isOpen={dialogType === "delete"}
        onClose={closeDialog}
        onTransactionDeleted={handleDataChange}
      />
    </>
  );
}