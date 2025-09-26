"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { TransactionTableWithActions } from "@/components/dashboard/transactions/TransactionTableWithActions";
import { Transaction } from "@/types/transactions";

interface PropertyRecentTransactionsCardProps {
  propertyId: string;
  propertyName: string;
  transactions: Transaction[];
  isLoading: boolean;
  error?: { message: string } | null;
  onNavigate?: (url: string) => void;
}

export function PropertyRecentTransactionsCard({
  propertyId,
  propertyName,
  transactions,
  isLoading,
  error,
  onNavigate,
}: PropertyRecentTransactionsCardProps) {
  const router = useRouter();

  const handleViewAllTransactions = () => {
    const url = `/dashboard/transactions?propertyId=${propertyId}`;
    if (onNavigate) {
      onNavigate(url);
    }
  };

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewAllTransactions}
            className="flex items-center gap-2"
          >
            View all transactions
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Last 25 transactions of this property.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error.message}</p>
          </div>
        ) : (
          <TransactionTableWithActions
            transactions={transactions}
            loading={isLoading}
            showPropertyColumn={false}
            emptyMessage={`No transactions found for ${propertyName}`}
            readOnly={true}
            showSelection={false}
            maxRows={25}
            className="space-y-0"
          />
        )}
      </CardContent>
    </Card>
  );
}
