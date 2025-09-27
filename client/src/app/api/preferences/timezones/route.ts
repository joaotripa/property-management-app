import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAllTimezones } from "@/lib/db/preferences";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const timezones = await getAllTimezones();

    return NextResponse.json(timezones);
  } catch (error) {
    console.error("Error fetching timezones:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}