import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRecentActivitiesForUser } from "@/lib/db/activities/queries";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "3");

    // Validate limit
    if (limit < 1 || limit > 20) {
      return NextResponse.json(
        { error: "Limit must be between 1 and 20" },
        { status: 400 }
      );
    }

    const activities = await getRecentActivitiesForUser(session.user.id, limit);

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent activities" },
      { status: 500 }
    );
  }
}