"use client";

import { useState, useTransition, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CategoryOption,
  PropertyOption,
  Transaction,
} from "@/types/transactions";
import { TransactionTable } from "@/components/dashboard/transactions/components/table/TransactionTable";
import { TransactionsPagination } from "@/components/dashboard/transactions/TransactionsPagination";
import { TransactionDialog } from "@/components/dashboard/transactions/components/dialogs/TransactionDialog";
import { TransactionDeleteDialog } from "@/components/dashboard/transactions/components/dialogs/TransactionDeleteDialog";
import { useBulkDeleteTransactions } from "@/hooks/queries/useTransactionQueries";
import { useUserTimezone } from "@/hooks/useUserTimezone";
import { useUserCurrency, getDefaultCurrency } from "@/hooks/useUserCurrency";
import { getSystemTimezone } from "@/lib/utils/timezone";
import TransactionStats from "@/components/dashboard/transactions/TransactionStats";
import { TransactionFilters } from "@/components/dashboard/filters/TransactionFilters";
import { useTransactionList } from "./hooks/useTransactionList";

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

interface FormatConfig {
  timezone: string;
  currencyCode: string;
}

interface TableActions {
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  onBulkDelete: (transactions: Transaction[]) => Promise<void>;
}

export function TransactionsClient({
  transactions: initialTransactions,
  totalCount: initialTotalCount,
  totalPages: initialTotalPages,
  currentPage: initialCurrentPage,
  pageSize: initialPageSize,
  categories,
  properties,
  canMutate,
}: TransactionsClientProps) {
  const [dialogType, setDialogType] = useState<
    "transaction" | "delete" | null
  >(null);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bulkDeleteMutation = useBulkDeleteTransactions();

  const { data: transactionListData, isLoading: isLoadingTransactions } = useTransactionList({
    initialTransactions,
    initialTotalCount,
    initialTotalPages,
    initialCurrentPage,
    initialPageSize,
  });

  const {
    transactions,
    totalCount,
    totalPages,
    currentPage,
    pageSize,
  } = transactionListData;

  const { data: userTimezone } = useUserTimezone();
  const { data: userCurrency } = useUserCurrency();

  const formatConfig: FormatConfig = useMemo(
    () => ({
      timezone: userTimezone || getSystemTimezone(),
      currencyCode: (userCurrency || getDefaultCurrency()).code,
    }),
    [userTimezone, userCurrency]
  );

  const searchQuery = searchParams.get("search") || "";

  const openDialog = (
    type: "transaction" | "delete",
    transaction?: Transaction
  ) => {
    setDialogType(type);
    setSelectedTransaction(transaction || null);
  };

  const closeDialog = () => {
    setDialogType(null);
  };

  const handlePageChange = (page: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (page === 1) {
        params.delete("page");
      } else {
        params.set("page", page.toString());
      }
      router.push(`?${params.toString()}`);
    });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.delete("page"); // Reset to page 1
      if (newPageSize === 25) {
        params.delete("pageSize");
      } else {
        params.set("pageSize", newPageSize.toString());
      }
      router.push(`?${params.toString()}`);
    });
  };

  const handleBulkDelete = useCallback(
    async (selectedTransactions: Transaction[]) => {
      try {
        const transactionIds = selectedTransactions.map((t) => t.id);
        const affectedPropertyIds = [
          ...new Set(selectedTransactions.map((t) => t.propertyId)),
        ];

        await bulkDeleteMutation.mutateAsync({
          transactionIds,
          affectedPropertyIds,
        });
      } catch (error) {
        throw error;
      }
    },
    [bulkDeleteMutation]
  );

  const tableActions: TableActions = useMemo(
    () => ({
      onEdit: (transaction: Transaction) => openDialog("transaction", transaction),
      onDelete: (transaction: Transaction) => openDialog("delete", transaction),
      onBulkDelete: handleBulkDelete,
    }),
    [handleBulkDelete]
  );

  return (
    <>
      {/* Summary Cards */}
      <TransactionStats />

      {/* Filters */}
      <TransactionFilters
        availableCategories={categories}
        availableProperties={properties}
        showPropertyFilter={true}
      />

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <TransactionTable
            transactions={transactions}
            loading={isPending || isLoadingTransactions}
            showPropertyColumn={true}
            {...tableActions}
            emptyMessage="No transactions found"
            readOnly={!canMutate}
            showSelection={canMutate}
            initialGlobalFilter={searchQuery}
            {...formatConfig}
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
              loading={isPending || isLoadingTransactions}
            />
          )}
        </CardContent>
      </Card>

      {/* Floating Add Button */}
      {canMutate && (
        <Button
          size="lg"
          onClick={() => openDialog("transaction")}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full hover:bg-primary/90 shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Dialogs */}
      <TransactionDialog
        isOpen={dialogType === "transaction"}
        onClose={closeDialog}
        properties={properties}
        categories={categories}
        transaction={selectedTransaction}
      />

      <TransactionDeleteDialog
        transaction={selectedTransaction}
        isOpen={dialogType === "delete"}
        onClose={closeDialog}
      />
    </>
  );
}
