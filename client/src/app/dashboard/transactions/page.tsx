import { auth } from "@/auth";
import { getTransactionsPageData, getTransactionStatsServerSide } from "@/lib/services/server/transactionsService";
import { TransactionsClient } from "@/components/dashboard/transactions/TransactionsClient";
import { ExportButton } from "@/components/dashboard/transactions/ExportButton";
import { canMutate } from "@/lib/stripe/server";
import { redirect } from "next/navigation";
import { UserSettingsService } from "@/lib/services/server/userSettingsService";
import { getSystemTimezone } from "@/lib/utils/timezone";
import { getDefaultCurrency } from "@/hooks/useUserCurrency";

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
  const [
    {
      transactions,
      totalCount,
      totalPages,
      currentPage,
      pageSize,
      categories,
      properties
    },
    accessControl,
    userSettings,
    initialStats
  ] = await Promise.all([
    getTransactionsPageData(session.user.id, params),
    canMutate(session.user.id),
    UserSettingsService.getUserSettings(session.user.id),
    getTransactionStatsServerSide(session.user.id, 'current-month')
  ]);

  // Extract timezone and currency with fallbacks
  const timezone = userSettings?.timezone.iana || getSystemTimezone();
  const currencyCode = userSettings?.currency.code || getDefaultCurrency().code;

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
        <ExportButton searchParams={params} />
      </div>

      {/* Client Component - Single Boundary */}
      <TransactionsClient
        transactions={transactions}
        totalCount={totalCount}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
        categories={categories}
        properties={properties}
        canMutate={accessControl}
        timezone={timezone}
        currencyCode={currencyCode}
        initialStats={initialStats}
      />
    </div>
  );
}
