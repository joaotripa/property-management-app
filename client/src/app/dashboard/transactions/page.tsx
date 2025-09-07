"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { useTransactionFilters } from "@/hooks/useTransactionFilters";
import { useTransactions } from "@/hooks/useTransactions";
import {
  CategoryOption,
  PropertyOption,
  Transaction,
} from "@/types/transactions";
import { TransactionFilters } from "@/components/filters/TransactionFilters";
import TransactionStats from "@/components/transactions/TransactionStats";
import { TransactionTableWithActions } from "@/components/transactions/TransactionTableWithActions";
import { TransactionsPagination } from "@/components/transactions/TransactionsPagination";
import { TransactionCreateDialog } from "@/components/transactions/TransactionCreateDialog";
import { TransactionEditDialog } from "@/components/transactions/TransactionEditDialog";
import { TransactionDeleteDialog } from "@/components/transactions/TransactionDeleteDialog";

export default function TransactionsPage() {
  const [availableCategories, setAvailableCategories] = useState<
    CategoryOption[]
  >([]);
  const [availableProperties, setAvailableProperties] = useState<
    PropertyOption[]
  >([]);
  const [dialogType, setDialogType] = useState<
    "create" | "edit" | "delete" | null
  >(null);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const { filters, setFilters } = useTransactionFilters();
  const {
    transactions,
    loading,
    error,
    totalCount,
    totalPages,
    currentPage,
    pageSize,
    refetch,
    setPage,
    setPageSize,
  } = useTransactions(filters);

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [categoriesRes, propertiesRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/properties"),
        ]);

        if (categoriesRes.ok && propertiesRes.ok) {
          const [categoriesData, propertiesData] = await Promise.all([
            categoriesRes.json(),
            propertiesRes.json(),
          ]);

          setAvailableCategories(categoriesData.categories || []);
          setAvailableProperties(propertiesData.properties || []);
        }
      } catch (error) {
        console.error("Error loading filter options:", error);
      }
    };

    loadFilterOptions();
  }, []);

  const openDialog = (
    type: "create" | "edit" | "delete",
    transaction?: Transaction
  ) => {
    setDialogType(type);
    setSelectedTransaction(transaction || null);
  };

  const closeDialog = () => {
    setDialogType(null);
  };

  const handleDataChange = async () => {
    try {
      refetch();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  if (error) {
    return (
      <div className="flex gap-8 p-6 max-w-7xl mx-auto">
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-6 text-center">
            <p className="text-destructive font-medium">
              Failed to load transactions
            </p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button
              onClick={refetch}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-7xl p-6 gap-6 mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">
            See what&apos;s coming in and what&apos;s heading out.
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Summary Cards */}
      <TransactionStats filters={filters} />

      {/* Filters */}
      <TransactionFilters
        onFiltersChange={setFilters}
        showPropertyFilter={true}
        availableCategories={availableCategories}
        availableProperties={availableProperties}
        initialFilters={filters}
      />

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <TransactionTableWithActions
            transactions={transactions}
            loading={loading}
            showPropertyColumn={true}
            onEdit={(transaction) => openDialog("edit", transaction)}
            onDelete={(transaction) => openDialog("delete", transaction)}
            emptyMessage={
              loading ? "Loading transactions..." : "No transactions found"
            }
          />

          {/* Pagination */}
          {totalCount > 0 && (
            <TransactionsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              loading={loading}
            />
          )}
        </CardContent>
      </Card>

      {/* Floating Add Button */}
      <Button
        size="lg"
        onClick={() => openDialog("create")}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full hover:bg-primary/90 shadow-lg hover:shadow-xl transition-shadow"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Dialogs */}
      <TransactionCreateDialog
        isOpen={dialogType === "create"}
        onClose={closeDialog}
        onTransactionCreated={handleDataChange}
        properties={availableProperties}
        categories={availableCategories}
      />

      <TransactionEditDialog
        transaction={selectedTransaction}
        isOpen={dialogType === "edit"}
        onClose={closeDialog}
        onTransactionUpdated={handleDataChange}
        properties={availableProperties}
        categories={availableCategories}
      />

      <TransactionDeleteDialog
        transaction={selectedTransaction}
        isOpen={dialogType === "delete"}
        onClose={closeDialog}
        onTransactionDeleted={handleDataChange}
      />
    </div>
  );
}
