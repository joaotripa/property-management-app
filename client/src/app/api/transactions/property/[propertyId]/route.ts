import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { 
  softDeletePropertyTransactions,
  restorePropertyTransactions,
  getPropertyTransactionCount 
} from "@/lib/db/transactions";
import { validatePropertyAccess } from "@/lib/db/properties";

interface RouteParams {
  params: Promise<{
    propertyId: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const { propertyId } = await params;

    // Validate property access
    const hasAccess = await validatePropertyAccess(propertyId, session.user.id);
    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          message: "Property not found or access denied",
        },
        { status: 404 }
      );
    }

    const counts = await getPropertyTransactionCount(propertyId, session.user.id);

    return NextResponse.json({
      success: true,
      message: "Transaction counts retrieved successfully",
      counts,
    });
  } catch (error) {
    console.error("GET /api/transactions/property/[propertyId] error:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve transaction counts",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const { propertyId } = await params;

    // Validate property access
    const hasAccess = await validatePropertyAccess(propertyId, session.user.id);
    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          message: "Property not found or access denied",
        },
        { status: 404 }
      );
    }

    const result = await softDeletePropertyTransactions(propertyId, session.user.id);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.count} transactions`,
      count: result.count,
    });
  } catch (error) {
    console.error("DELETE /api/transactions/property/[propertyId] error:", error);

    if (error instanceof Error) {
      if (error.message.includes("not found") || error.message.includes("access denied")) {
        return NextResponse.json(
          {
            success: false,
            message: "Property not found or access denied",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete property transactions",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const { propertyId } = await params;

    // Validate property access
    const hasAccess = await validatePropertyAccess(propertyId, session.user.id);
    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          message: "Property not found or access denied",
        },
        { status: 404 }
      );
    }

    const result = await restorePropertyTransactions(propertyId, session.user.id);

    return NextResponse.json({
      success: true,
      message: `Successfully restored ${result.count} transactions`,
      count: result.count,
    });
  } catch (error) {
    console.error("PUT /api/transactions/property/[propertyId] error:", error);

    if (error instanceof Error) {
      if (error.message.includes("not found") || error.message.includes("access denied")) {
        return NextResponse.json(
          {
            success: false,
            message: "Property not found or access denied",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to restore property transactions",
      },
      { status: 500 }
    );
  }
}