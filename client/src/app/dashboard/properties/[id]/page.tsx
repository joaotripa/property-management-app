import { auth } from "@/auth";
import { getPropertyDetailsData } from "@/lib/services/server/propertyDetailsService";
import { PropertyDetailsClient } from "@/components/dashboard/properties/PropertyDetailsClient";
import { PropertyErrorBoundary } from "@/components/dashboard/properties/PropertyErrorBoundary";
import { redirect, notFound } from "next/navigation";
import { canMutate } from "@/lib/stripe/server";
import { roundToTwoDecimals } from "@/lib/utils/formatting";

interface PropertyDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailsPage({
  params,
}: PropertyDetailsPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  try {
    const [detailsData, accessControl] = await Promise.all([
      getPropertyDetailsData(id, session.user.id),
      canMutate(session.user.id),
    ]);

    const initialMetrics = detailsData.currentMonthMetrics
      ? {
          income: detailsData.currentMonthMetrics.totalIncome,
          expenses: detailsData.currentMonthMetrics.totalExpenses,
          cashFlow: detailsData.currentMonthMetrics.cashFlow,
          roi:
            detailsData.property.purchasePrice &&
            detailsData.property.purchasePrice > 0
              ? roundToTwoDecimals(
                  (detailsData.currentMonthMetrics.cashFlow /
                    detailsData.property.purchasePrice) *
                    100
                )
              : 0,
        }
      : undefined;

    return (
      <div className="flex flex-col gap-6 px-6 pb-6 pt-2 max-w-7xl mx-auto">
        <PropertyErrorBoundary>
          <PropertyDetailsClient
            initialProperty={detailsData.property}
            initialImages={detailsData.images}
            initialTransactions={detailsData.recentTransactions}
            initialMetrics={initialMetrics}
            canMutate={accessControl}
          />
        </PropertyErrorBoundary>
      </div>
    );
  } catch (error) {
    console.error("Error loading property details:", error);
    notFound();
  }
}
