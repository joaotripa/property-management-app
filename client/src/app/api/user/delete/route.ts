import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/config/database";
import { z } from "zod";
import { deleteAccountApiSchema } from "@/lib/validations/user";

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const validatedData = deleteAccountApiSchema.parse(body);
    
    if (validatedData.email !== session.user.email) {
      return NextResponse.json(
        { error: "Email does not match your account" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user!.id },
      select: {
        id: true,
        email: true,
        deletedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.deletedAt) {
      return NextResponse.json(
        { error: "Account is already deleted" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      const now = new Date();

      await tx.user.update({
        where: { id: session.user!.id },
        data: {
          email: `deleted_${now.getTime()}_${user.email}`,
          deletedAt: now,
          updatedAt: now,
          name: null,
          phone: null,
          image: null,
        },
      });

      await tx.property.updateMany({
        where: {
          userId: session.user!.id,
          deletedAt: null,
        },
        data: {
          deletedAt: now,
          updatedAt: now,
        },
      });

      await tx.transaction.updateMany({
        where: {
          userId: session.user!.id,
          deletedAt: null,
        },
        data: {
          deletedAt: now,
          updatedAt: now,
        },
      });
    });

    console.log(`Account deleted for user: ${user.email} at ${new Date().toISOString()}`);

    return NextResponse.json({ 
      success: true,
      message: "Account deleted successfully"
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}