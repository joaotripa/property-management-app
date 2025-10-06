import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/config/database";
import { z } from "zod";
import { deleteAccountApiSchema } from "@/lib/validations/user";

// DELETE /api/user/delete - Soft delete user account
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
    
    // Verify email matches current user
    if (validatedData.email !== session.user.email) {
      return NextResponse.json(
        { error: "Email does not match your account" },
        { status: 400 }
      );
    }

    // Get current user to verify they exist and aren't already deleted
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

    // Use transaction to ensure all operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      const now = new Date();

      // Soft delete user account
      await tx.user.update({
        where: { id: session.user!.id },
        data: {
          deletedAt: now,
          updatedAt: now,
        },
      });

      // Soft delete all user's properties
      await tx.property.updateMany({
        where: { 
          userId: session.user!.id,
          deletedAt: null, // Only update properties that aren't already deleted
        },
        data: {
          deletedAt: now,
          updatedAt: now,
        },
      });

      // Soft delete all user's transactions
      await tx.transaction.updateMany({
        where: { 
          userId: session.user!.id,
          deletedAt: null, // Only update transactions that aren't already deleted
        },
        data: {
          deletedAt: now,
          updatedAt: now,
        },
      });

      // Note: We're not deleting sessions here as NextAuth will handle session cleanup
      // and we want the user to be signed out gracefully
    });

    // Log account deletion event
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