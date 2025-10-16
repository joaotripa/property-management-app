import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserSettings } from "@/lib/db/userSettings";
import { UserSettingsService } from "@/lib/services/server/userSettingsService";
import {
  updateUserSettingsRequestSchema
} from "@/lib/validations/userSettings";
import { ZodError } from "zod";
import { initializeUserAccount } from "@/lib/utils/userProvisioning";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    let userSettings = await getUserSettings(session.user.id);

    // Safety net: If settings don't exist, initialize account
    if (!userSettings) {
      console.warn(`UserSettings not found for userId: ${session.user.id} - initializing...`);

      const initResult = await initializeUserAccount(session.user.id);

      if (initResult.created.userSettings) {
        userSettings = await getUserSettings(session.user.id);
      }

      if (!userSettings) {
        return NextResponse.json(
          { success: false, message: "Failed to initialize user settings" },
          { status: 500 }
        );
      }
    }

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

    const userSettings = await UserSettingsService.updateUserSettings(
      session.user.id,
      validatedData
    );

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