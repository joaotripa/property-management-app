import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getUserSettings,
  upsertUserSettings
} from "@/lib/db/userSettings";
import {
  getCurrencyById,
  getTimezoneById
} from "@/lib/db/preferences";
import {
  updateUserSettingsRequestSchema
} from "@/lib/validations/userSettings";
import { ZodError } from "zod";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userSettings = await getUserSettings(session.user.id);

    return NextResponse.json(userSettings);
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateUserSettingsRequestSchema.parse(body);

    // Validate that the currency and timezone exist
    const [currency, timezone] = await Promise.all([
      getCurrencyById(validatedData.currencyId),
      getTimezoneById(validatedData.timezoneId),
    ]);

    if (!currency) {
      return NextResponse.json(
        { success: false, message: "Invalid currency selected" },
        { status: 400 }
      );
    }

    if (!timezone) {
      return NextResponse.json(
        { success: false, message: "Invalid timezone selected" },
        { status: 400 }
      );
    }

    const userSettings = await upsertUserSettings({
      userId: session.user.id,
      currencyId: validatedData.currencyId,
      timezoneId: validatedData.timezoneId,
    });

    const response = {
      success: true,
      message: "Settings updated successfully",
      userSettings,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating user settings:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input data",
          errors: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}