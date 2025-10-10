import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPortfolioKPIs, getPropertyKPIs } from "@/lib/db/analytics/queries";

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
    const includePropertyDetails = searchParams.get("includePropertyDetails") === "true";

    if (dateFrom && isNaN(dateFrom.getTime())) {
      return NextResponse.json({ error: "Invalid dateFrom parameter" }, { status: 400 });
    }
    if (dateTo && isNaN(dateTo.getTime())) {
      return NextResponse.json({ error: "Invalid dateTo parameter" }, { status: 400 });
    }

    const [portfolioKPIs, propertyKPIs] = await Promise.all([
      getPortfolioKPIs(session.user.id, propertyId, dateFrom, dateTo),
      includePropertyDetails ? getPropertyKPIs(session.user.id, propertyId, dateFrom, dateTo) : Promise.resolve([]),
    ]);

    return NextResponse.json({
      portfolio: portfolioKPIs,
      properties: propertyKPIs,
    });
  } catch (error) {
    console.error("Error fetching analytics KPIs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}