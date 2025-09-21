import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getCashFlowTrend,
  getCashFlowTrendWeekly,
  getExpenseBreakdown
} from "@/lib/db/analytics/queries";
import {
  DataGranularity,
  validateGranularityTimeRange,
  selectOptimalGranularity,
  selectFinanceGranularity
} from "@/lib/types/granularity";
import { calculateDateRange } from "@/lib/utils/dateRange";

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
    const monthsBackParam = searchParams.get("monthsBack");
    const timeRange = searchParams.get("timeRange") || "semester"; // Default to semester
    const chartType = searchParams.get("chartType"); // specific chart type if needed
    const granularity = searchParams.get("granularity") as DataGranularity | null;

    // Handle monthsBack - can be null for full history
    let monthsBack: number | null = null;
    if (monthsBackParam && monthsBackParam !== "null") {
      monthsBack = parseInt(monthsBackParam, 10);
    } else if (timeRange !== "full") {
      // Calculate from timeRange if not full history
      const { monthsBack: calculatedMonthsBack } = calculateDateRange(timeRange);
      monthsBack = calculatedMonthsBack;
    }

    // Validate parameters (skip validation for full history)
    if (monthsBack !== null && (monthsBack < 1 || monthsBack > 60)) {
      return NextResponse.json({ error: "monthsBack must be between 1 and 60, or null for full history" }, { status: 400 });
    }

    if (dateFrom && isNaN(dateFrom.getTime())) {
      return NextResponse.json({ error: "Invalid dateFrom parameter" }, { status: 400 });
    }
    if (dateTo && isNaN(dateTo.getTime())) {
      return NextResponse.json({ error: "Invalid dateTo parameter" }, { status: 400 });
    }

    // Validate granularity parameter
    if (granularity && !['daily', 'weekly', 'monthly', 'yearly'].includes(granularity)) {
      return NextResponse.json({ error: "granularity must be 'daily', 'weekly', 'monthly', or 'yearly'" }, { status: 400 });
    }

    // Validate granularity vs time range compatibility
    if (granularity) {
      const validation = validateGranularityTimeRange(granularity, monthsBack);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }

    // Fetch chart data based on type or all data
    const promises: Promise<unknown>[] = [];
    const dataKeys: string[] = [];

    if (!chartType || chartType === "cashflow") {
      // Use specified granularity, finance-aware selection, or fallback to optimal
      const effectiveGranularity = granularity ||
        (timeRange ? selectFinanceGranularity(timeRange) : selectOptimalGranularity(monthsBack));

      // Route to appropriate function based on granularity
      if (effectiveGranularity === 'weekly') {
        promises.push(getCashFlowTrendWeekly(session.user.id, propertyId, monthsBack));
        dataKeys.push("weeklyCashFlowTrend");
      } else if (effectiveGranularity === 'daily') {
        // TODO: Implement daily granularity - for now fall back to weekly
        promises.push(getCashFlowTrendWeekly(session.user.id, propertyId, monthsBack));
        dataKeys.push("weeklyCashFlowTrend");
      } else if (effectiveGranularity === 'yearly') {
        // TODO: Implement yearly granularity - for now use monthly
        promises.push(getCashFlowTrend(session.user.id, propertyId, monthsBack));
        dataKeys.push("cashFlowTrend");
      } else {
        // Default to monthly
        promises.push(getCashFlowTrend(session.user.id, propertyId, monthsBack));
        dataKeys.push("cashFlowTrend");
      }
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