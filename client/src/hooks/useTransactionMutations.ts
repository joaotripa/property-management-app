"use client";

import { useState } from "react";
import { Transaction } from "@/types/transactions";
import { TransactionType } from "@/types/transactions";

export interface CreateTransactionData {
  amount: number;
  type: TransactionType;
  description?: string;
  transactionDate: string;
  isRecurring: boolean;
  propertyId: string;
  categoryId: string;
}

export interface UpdateTransactionData extends Partial<CreateTransactionData> {
  id: string;
}

export interface UseTransactionMutationsReturn {
  createTransaction: (data: CreateTransactionData) => Promise<Transaction>;
  updateTransaction: (data: UpdateTransactionData) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useTransactionMutations(): UseTransactionMutationsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTransaction = async (data: CreateTransactionData): Promise<Transaction> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create transaction");
      }

      // Transform date strings to Date objects
      const transaction: Transaction = {
        ...result.transaction,
        transactionDate: new Date(result.transaction.transactionDate),
        createdAt: new Date(result.transaction.createdAt),
        updatedAt: new Date(result.transaction.updatedAt),
      };

      return transaction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create transaction';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (data: UpdateTransactionData): Promise<Transaction> => {
    setLoading(true);
    setError(null);
    
    try {
      const { id, ...updateData } = data;
      
      const response = await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update transaction");
      }

      // Transform date strings to Date objects
      const transaction: Transaction = {
        ...result.transaction,
        transactionDate: new Date(result.transaction.transactionDate),
        createdAt: new Date(result.transaction.createdAt),
        updatedAt: new Date(result.transaction.updatedAt),
      };

      return transaction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update transaction';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete transaction");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete transaction';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createTransaction,
    updateTransaction,
    deleteTransaction,
    loading,
    error,
  };
}