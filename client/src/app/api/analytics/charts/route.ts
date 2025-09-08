import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { 
  getCashFlowTrend, 
  getExpenseBreakdown
} from "@/lib/db/analytics/queries";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    
    const propertyId = searchParams.get("propertyId") || undefined;
    const dateFrom = searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom")!) : undefined;
    const dateTo = searchParams.get("dateTo") ? new Date(searchParams.get("dateTo")!) : undefined;
    const monthsBack = parseInt(searchParams.get("monthsBack") || "12", 10);
    const chartType = searchParams.get("chartType"); // specific chart type if needed

    // Validate parameters
    if (monthsBack < 1 || monthsBack > 60) {
      return NextResponse.json({ error: "monthsBack must be between 1 and 60" }, { status: 400 });
    }

    if (dateFrom && isNaN(dateFrom.getTime())) {
      return NextResponse.json({ error: "Invalid dateFrom parameter" }, { status: 400 });
    }
    if (dateTo && isNaN(dateTo.getTime())) {
      return NextResponse.json({ error: "Invalid dateTo parameter" }, { status: 400 });
    }

    // Fetch chart data based on type or all data
    const promises: Promise<unknown>[] = [];
    const dataKeys: string[] = [];

    if (!chartType || chartType === "cashflow") {
      promises.push(getCashFlowTrend(session.user.id, propertyId, monthsBack));
      dataKeys.push("cashFlowTrend");
    }

    if (!chartType || chartType === "expenses") {
      promises.push(getExpenseBreakdown(session.user.id, propertyId, dateFrom, dateTo));
      dataKeys.push("expenseBreakdown");
    }


    const results = await Promise.all(promises);

    const response: Record<string, unknown> = {};
    dataKeys.forEach((key, index) => {
      response[key] = results[index];
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching analytics charts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}