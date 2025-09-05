import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTransactionStats } from "@/lib/db/transactions/queries";
import { TransactionType } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;

    // Parse the same filter parameters as the main transactions endpoint
    const filters = {
      dateFrom: searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom")!) : undefined,
      dateTo: searchParams.get("dateTo") ? new Date(searchParams.get("dateTo")!) : undefined,
      type: searchParams.get("type") as TransactionType | "all" | null,
      amountMin: searchParams.get("amountMin") ? parseFloat(searchParams.get("amountMin")!) : undefined,
      amountMax: searchParams.get("amountMax") ? parseFloat(searchParams.get("amountMax")!) : undefined,
      categoryIds: searchParams.get("categoryIds")?.split(",").filter(Boolean),
      isRecurring: searchParams.get("isRecurring") === "true" ? true : searchParams.get("isRecurring") === "false" ? false : undefined,
      propertyId: searchParams.get("propertyId") || undefined,
      search: searchParams.get("search") || undefined,
    };

    // Clean up type filter
    if (filters.type === "all") {
      filters.type = null;
    }

    const stats = await getTransactionStats(session.user.id, {
      ...filters,
      type: filters.type as TransactionType | undefined,
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching transaction stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}