import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPropertyStats } from "@/lib/db/properties/queries";
import { errorResponseSchema } from "@/lib/db/properties";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        errorResponseSchema.parse({
          success: false,
          message: "Authentication required",
        }),
        { status: 401 }
      );
    }

    const stats = await getPropertyStats(session.user.id);

    return NextResponse.json({
      success: true,
      message: "Property statistics retrieved successfully",
      stats,
    });
  } catch (error) {
    console.error("GET /api/properties/stats error:", error);

    return NextResponse.json(
      errorResponseSchema.parse({
        success: false,
        message: "Failed to retrieve property statistics",
      }),
      { status: 500 }
    );
  }
}

