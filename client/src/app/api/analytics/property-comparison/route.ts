import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPropertyRanking, getPropertyKPIs } from "@/lib/db/analytics/queries";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    
    const dateFrom = searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom")!) : undefined;
    const dateTo = searchParams.get("dateTo") ? new Date(searchParams.get("dateTo")!) : undefined;
    const sortBy = searchParams.get("sortBy") || "netIncome"; // netIncome, roi
    const includeKPIs = searchParams.get("includeKPIs") === "true";

    // Validate dates
    if (dateFrom && isNaN(dateFrom.getTime())) {
      return NextResponse.json({ error: "Invalid dateFrom parameter" }, { status: 400 });
    }
    if (dateTo && isNaN(dateTo.getTime())) {
      return NextResponse.json({ error: "Invalid dateTo parameter" }, { status: 400 });
    }

    // Validate sortBy parameter
    const validSortFields = ["netIncome", "roi", "totalIncome", "totalExpenses"];
    if (!validSortFields.includes(sortBy)) {
      return NextResponse.json({ error: "Invalid sortBy parameter" }, { status: 400 });
    }

    const [propertyRanking, propertyKPIs] = await Promise.all([
      getPropertyRanking(session.user.id, dateFrom, dateTo),
      includeKPIs ? getPropertyKPIs(session.user.id, undefined, dateFrom, dateTo) : Promise.resolve([]),
    ]);

    // Sort property ranking based on the requested field
    const sortedRanking = [...propertyRanking].sort((a, b) => {
      switch (sortBy) {
        case "roi":
          return b.roi - a.roi;
        case "totalIncome":
          return b.totalIncome - a.totalIncome;
        case "totalExpenses":
          return b.totalExpenses - a.totalExpenses;
        case "netIncome":
        default:
          return b.netIncome - a.netIncome;
      }
    });

    // Sort property KPIs if included
    const sortedKPIs = includeKPIs ? [...propertyKPIs].sort((a, b) => {
      switch (sortBy) {
        case "roi":
          return b.roi - a.roi;
        case "netIncome":
        default:
          return b.netIncome - a.netIncome;
      }
    }) : [];

    return NextResponse.json({
      propertyRanking: sortedRanking,
      propertyKPIs: sortedKPIs,
      sortBy,
      totalProperties: propertyRanking.length,
    });
  } catch (error) {
    console.error("Error fetching property comparison analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}