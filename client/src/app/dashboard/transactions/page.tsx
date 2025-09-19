import { auth } from "@/auth";
import { getTransactionsPageData } from "@/lib/services/server/transactionsService";
import { TransactionsClient } from "@/components/dashboard/transactions/TransactionsClient";
import TransactionStats from "@/components/dashboard/transactions/TransactionStats";
import { TransactionFilters } from "@/components/dashboard/filters/TransactionFilters";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface TransactionsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Await search params and fetch data server-side
  const params = await searchParams;
  const {
    transactions,
    totalCount,
    totalPages,
    currentPage,
    pageSize,
    stats,
    categories,
    properties
  } = await getTransactionsPageData(session.user.id, params);

  return (
    <div className="flex flex-col max-w-7xl px-6 pb-6 gap-8 mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl md:text-4xl font-bold">Transactions</h2>
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
      <TransactionStats stats={stats} />

      {/* Beautiful shadcn/ui Filters with Instant Filtering */}
      <TransactionFilters
        availableCategories={categories}
        availableProperties={properties}
        showPropertyFilter={true}
      />

      {/* Client Component for Interactions */}
      <TransactionsClient
        transactions={transactions}
        totalCount={totalCount}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
        categories={categories}
        properties={properties}
      />
    </div>
  );
}
