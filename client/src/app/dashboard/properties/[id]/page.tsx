import { auth } from "@/auth";
import { getPropertyDetailsData } from "@/lib/services/server/propertyDetailsService";
import { PropertyDetailsClient } from "@/components/dashboard/properties/PropertyDetailsClient";
import { redirect, notFound } from "next/navigation";
import { canMutate } from "@/lib/stripe/server";

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

    return (
      <div className="flex flex-col gap-8 px-6 pb-6 max-w-7xl mx-auto">
        <PropertyDetailsClient
          initialProperty={detailsData.property}
          initialImages={detailsData.images}
          initialMetrics={detailsData.currentMonthMetrics}
          initialTransactions={detailsData.recentTransactions}
          canMutate={accessControl}
        />
      </div>
    );
  } catch (error) {
    console.error("Error loading property details:", error);
    notFound();
  }
}
