import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { VisibilityState } from "@tanstack/react-table";

export const DEFAULT_COLUMN_VISIBILITY: VisibilityState = {
  select: true,
  amount: true,
  type: true,
  description: true,
  transactionDate: true,
  category: true,
  property: true,
  actions: true,
};

interface TransactionTableState {
  columnVisibility: VisibilityState;
  setColumnVisibility: (visibility: VisibilityState | ((prev: VisibilityState) => VisibilityState)) => void;
  resetColumnVisibility: () => void;
}

export const useTransactionTableStore = create<TransactionTableState>()(
  persist(
    (set) => ({
      columnVisibility: DEFAULT_COLUMN_VISIBILITY,
      setColumnVisibility: (visibility) =>
        set((state) => ({
          columnVisibility:
            typeof visibility === "function"
              ? visibility(state.columnVisibility)
              : visibility,
        })),
      resetColumnVisibility: () =>
        set({ columnVisibility: DEFAULT_COLUMN_VISIBILITY }),
    }),
    {
      name: "transaction-table-storage",
      partialize: (state) => ({
        columnVisibility: Object.fromEntries(
          Object.entries(state.columnVisibility).filter(
            ([key]) => key !== "property"
          )
        ),
      }),
    }
  )
);
