import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  recalculateUserMetrics,
  recalculatePropertyMetrics,
  validateMonthlyMetrics,
  cleanupEmptyMetrics
} from "@/lib/services/monthlyMetricsService";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      propertyId,
      fromDate,
      toDate,
      cleanup = false,
      validate = false
    } = body;

    // Parse dates if provided
    const parsedFromDate = fromDate ? new Date(fromDate) : undefined;
    const parsedToDate = toDate ? new Date(toDate) : undefined;

    // Validate dates
    if (parsedFromDate && isNaN(parsedFromDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid fromDate format" },
        { status: 400 }
      );
    }

    if (parsedToDate && isNaN(parsedToDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid toDate format" },
        { status: 400 }
      );
    }

    const result: {
      validation?: Record<string, unknown>;
      recalculation?: Record<string, unknown>;
      cleanup?: Record<string, unknown>;
    } = {};

    // Perform validation first if requested
    if (validate && propertyId) {
      try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        const validationResult = await validateMonthlyMetrics(
          session.user.id,
          propertyId,
          currentYear,
          currentMonth
        );

        result.validation = validationResult;
      } catch (validationError) {
        console.error('Error validating monthly metrics:', validationError);
        result.validation = { error: 'Failed to validate metrics' };
      }
    }

    // Recalculate metrics
    if (propertyId) {
      // Recalculate for specific property
      const recalcResult = await recalculatePropertyMetrics(
        session.user.id,
        propertyId,
        parsedFromDate,
        parsedToDate
      );
      result.recalculation = {
        type: 'property',
        propertyId,
        ...recalcResult
      };
    } else {
      // Recalculate for all user properties
      const recalcResult = await recalculateUserMetrics(
        session.user.id,
        parsedFromDate,
        parsedToDate
      );
      result.recalculation = {
        type: 'user',
        ...recalcResult
      };
    }

    // Cleanup empty metrics if requested
    if (cleanup) {
      const cleanupResult = await cleanupEmptyMetrics(session.user.id);
      result.cleanup = cleanupResult;
    }

    return NextResponse.json(
      {
        message: "Monthly metrics reconciliation completed successfully",
        result,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error reconciling monthly metrics:", error);

    if (error instanceof Error) {
      if (error.message.includes("Property not found")) {
        return NextResponse.json(
          { error: "Property not found or access denied" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const propertyId = searchParams.get("propertyId");
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    if (!propertyId || !year || !month) {
      return NextResponse.json(
        { error: "Missing required parameters: propertyId, year, month" },
        { status: 400 }
      );
    }

    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return NextResponse.json(
        { error: "Invalid year or month values" },
        { status: 400 }
      );
    }

    const validationResult = await validateMonthlyMetrics(
      session.user.id,
      propertyId,
      yearNum,
      monthNum
    );

    return NextResponse.json({
      validation: validationResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error validating monthly metrics:", error);

    if (error instanceof Error) {
      if (error.message.includes("Property not found")) {
        return NextResponse.json(
          { error: "Property not found or access denied" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}