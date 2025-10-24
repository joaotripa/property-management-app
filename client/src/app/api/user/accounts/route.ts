import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/config/database";

// GET /api/user/accounts - Get current user's authentication accounts
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const accounts = await prisma.account.findMany({
      where: { userId: session.user.id },
      select: {
        provider: true,
        type: true,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        passwordHash: true,
        email: true,
      },
    });

    const hasGoogleAccount = accounts.some(account => account.provider === "google");
    const hasPassword = !!user?.passwordHash;

    return NextResponse.json({
      email: user?.email,
      accounts: accounts.map(account => ({
        provider: account.provider,
        type: account.type,
      })),
      hasGoogleAccount,
      hasPassword,
      canChangePassword: hasPassword && !hasGoogleAccount,
    });
  } catch (error) {
    console.error("Error fetching user accounts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}