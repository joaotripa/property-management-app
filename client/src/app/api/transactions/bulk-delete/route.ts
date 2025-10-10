import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { bulkSoftDeleteTransactions } from "@/lib/db/transactions/mutations";
import { canMutate } from "@/lib/stripe/server";
import { z } from "zod";

// Validation schema for bulk delete request
const bulkDeleteSchema = z.object({
  transactionIds: z
    .array(z.string().uuid("Invalid transaction ID"))
    .min(1, "At least one transaction ID is required")
    .max(100, "Cannot delete more than 100 transactions at once"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canModify = await canMutate(session.user.id);
    if (!canModify) {
      return NextResponse.json(
        { error: "Subscription required to delete transactions" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = bulkDeleteSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { transactionIds } = validationResult.data;

    // Perform bulk soft delete
    const result = await bulkSoftDeleteTransactions(
      transactionIds,
      session.user.id
    );

    return NextResponse.json({
      message: `${result.deletedCount} transaction(s) deleted successfully`,
      deletedCount: result.deletedCount,
      failedCount: result.failedCount,
      failedIds: result.failedIds,
    });
  } catch (error) {
    console.error("Error in bulk delete transactions:", error);

    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes("access denied")) {
        return NextResponse.json(
          { error: "Access denied to one or more transactions" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}