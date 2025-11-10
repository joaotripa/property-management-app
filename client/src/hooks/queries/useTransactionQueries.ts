import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  bulkDeleteTransactions,
} from "@/lib/services/client/transactionsService";
import { TransactionFormOutput } from "@/lib/validations/transaction";
import { toast } from "sonner";
import { PROPERTY_QUERY_KEYS } from "./usePropertyQueries";
import { trackEvent } from "@/lib/analytics/tracker";
import { TRANSACTION_EVENTS } from "@/lib/analytics/events";

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TransactionFormOutput) => {
      return await createTransaction(data);
    },

    onSuccess: (response, variables) => {
      // Invalidate transaction queries for this property
      queryClient.invalidateQueries({
        queryKey: PROPERTY_QUERY_KEYS.transactions(variables.propertyId),
      });

      // Invalidate analytics for this property
      queryClient.invalidateQueries({
        queryKey: PROPERTY_QUERY_KEYS.analytics.all(variables.propertyId),
      });

      // Invalidate property list (for stats update)
      queryClient.invalidateQueries({
        queryKey: PROPERTY_QUERY_KEYS.lists(),
      });

      toast.success("Transaction created successfully");
    },

    onError: (error) => {
      console.error("Error creating transaction:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create transaction"
      );
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: TransactionFormOutput;
    }) => {
      return await updateTransaction(id, data);
    },

    onSuccess: (response, { data }) => {
      // Invalidate transaction queries for this property
      queryClient.invalidateQueries({
        queryKey: PROPERTY_QUERY_KEYS.transactions(data.propertyId),
      });

      // Invalidate analytics for this property
      queryClient.invalidateQueries({
        queryKey: PROPERTY_QUERY_KEYS.analytics.all(data.propertyId),
      });

      // Invalidate property list (for stats update)
      queryClient.invalidateQueries({
        queryKey: PROPERTY_QUERY_KEYS.lists(),
      });

      toast.success("Transaction updated successfully");
    },

    onError: (error) => {
      console.error("Error updating transaction:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update transaction"
      );
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: { id: string; propertyId: string }) => {
      return await deleteTransaction(variables.id);
    },

    onSuccess: (_response, { propertyId }) => {
      // Invalidate transaction queries for this property
      queryClient.invalidateQueries({
        queryKey: PROPERTY_QUERY_KEYS.transactions(propertyId),
      });

      // Invalidate analytics for this property
      queryClient.invalidateQueries({
        queryKey: PROPERTY_QUERY_KEYS.analytics.all(propertyId),
      });

      // Invalidate property list (for stats update)
      queryClient.invalidateQueries({
        queryKey: PROPERTY_QUERY_KEYS.lists(),
      });

      trackEvent(TRANSACTION_EVENTS.TRANSACTION_DELETED);
      toast.success("Transaction deleted successfully");
    },

    onError: (error) => {
      console.error("Error deleting transaction:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete transaction"
      );
    },
  });
}

export function useBulkDeleteTransactions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionIds: string[]) => {
      return await bulkDeleteTransactions(transactionIds);
    },

    onSuccess: (response) => {
      // Invalidate all transaction queries (we don't know which properties were affected)
      queryClient.invalidateQueries({
        queryKey: PROPERTY_QUERY_KEYS.all,
      });

      // Invalidate all analytics (we don't know which properties were affected)
      queryClient.invalidateQueries({
        queryKey: [...PROPERTY_QUERY_KEYS.all, "analytics"],
      });

      if (response.failedCount > 0) {
        toast.warning(
          `Deleted ${response.deletedCount} transactions, ${response.failedCount} failed`
        );
      } else {
        toast.success(`Successfully deleted ${response.deletedCount} transactions`);
      }
    },

    onError: (error) => {
      console.error("Error bulk deleting transactions:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete transactions"
      );
    },
  });
}
