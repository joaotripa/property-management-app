"use client";

import { useState, useTransition, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CategoryOption,
  PropertyOption,
  Transaction,
  TransactionStatsData,
} from "@/types/transactions";
import { TransactionTable } from "@/components/dashboard/transactions/components/table/TransactionTable";
import { TransactionsPagination } from "@/components/dashboard/transactions/TransactionsPagination";
import { TransactionDialog } from "@/components/dashboard/transactions/components/dialogs/TransactionDialog";
import { TransactionDeleteDialog } from "@/components/dashboard/transactions/components/dialogs/TransactionDeleteDialog";
import { useBulkDeleteTransactions } from "@/hooks/queries/useTransactionQueries";
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
  timezone: string;
  currencyCode: string;
  initialStats: TransactionStatsData;
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
  timezone,
  currencyCode,
  initialStats,
}: TransactionsClientProps) {
  const [dialogType, setDialogType] = useState<"transaction" | "delete" | null>(
    null
  );
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bulkDeleteMutation = useBulkDeleteTransactions();

  const { data: transactionListData, isLoading: isLoadingTransactions } =
    useTransactionList({
      initialTransactions,
      initialTotalCount,
      initialTotalPages,
      initialCurrentPage,
      initialPageSize,
    });

  const { transactions, totalCount, totalPages, currentPage, pageSize } =
    transactionListData;

  const openDialog = useCallback(
    (type: "transaction" | "delete", transaction?: Transaction) => {
      setDialogType(type);
      setSelectedTransaction(transaction || null);
    },
    []
  );

  const closeDialog = useCallback(() => {
    setDialogType(null);
  }, []);

  const updateUrlParams = useCallback(
    (updates: Record<string, string | null>) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
          if (value === null) {
            params.delete(key);
          } else {
            params.set(key, value);
          }
        });
        router.push(`?${params.toString()}`);
      });
    },
    [searchParams, router]
  );

  const handlePageChange = (page: number) => {
    updateUrlParams({ page: page === 1 ? null : page.toString() });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    updateUrlParams({
      page: null,
      pageSize: newPageSize === 25 ? null : newPageSize.toString(),
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

  return (
    <>
      {/* Summary Cards */}
      <TransactionStats initialStats={initialStats} />

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
            onEdit={(transaction) => openDialog("transaction", transaction)}
            onDelete={(transaction) => openDialog("delete", transaction)}
            onBulkDelete={handleBulkDelete}
            emptyMessage="No transactions found"
            readOnly={!canMutate}
            showSelection={canMutate}
            initialGlobalFilter={searchParams.get("search") || ""}
            timezone={timezone}
            currencyCode={currencyCode}
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
