"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { TransactionTable } from "@/components/dashboard/transactions/components/table/TransactionTable";
import { Transaction } from "@/types/transactions";
import { RECENT_TRANSACTIONS_LIMIT } from "@/hooks/queries/usePropertyTransactionsQuery";

interface PropertyRecentTransactionsCardProps {
  propertyId: string;
  propertyName: string;
  transactions: Transaction[];
  isLoading: boolean;
  error?: { message: string } | null;
  timezone: string;
  currencyCode: string;
}

export function PropertyRecentTransactionsCard({
  propertyId,
  propertyName,
  transactions,
  isLoading,
  error,
  timezone,
  currencyCode,
}: PropertyRecentTransactionsCardProps) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Link href={`/dashboard/transactions?propertyId=${propertyId}`}>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-primary/80 hover:text-primary hover:bg-transparent"
            >
              View all transactions
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <CardDescription>
          Last {RECENT_TRANSACTIONS_LIMIT} transactions of this property.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error.message}</p>
          </div>
        ) : (
          <TransactionTable
            transactions={transactions}
            loading={isLoading}
            showPropertyColumn={false}
            emptyMessage={`No transactions found for ${propertyName}`}
            readOnly={true}
            showSelection={false}
            className="space-y-0"
            timezone={timezone}
            currencyCode={currencyCode}
            columnVisibilityOverrides={{ property: false, actions: false }}
          />
        )}
      </CardContent>
    </Card>
  );
}
