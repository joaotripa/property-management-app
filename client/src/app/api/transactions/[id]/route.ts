import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getTransactionById,
  updateTransaction,
  softDeleteTransaction
} from "@/lib/db/transactions/mutations";
import { TransactionType } from "@prisma/client";
import { canMutate } from "@/lib/stripe/server";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const transaction = await getTransactionById(id, session.user.id);

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canModify = await canMutate(session.user.id);
    if (!canModify) {
      return NextResponse.json(
        { error: "Subscription required to update transactions" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate required fields (if provided)
    if (body.type && !Object.values(TransactionType).includes(body.type)) {
      return NextResponse.json(
        { error: "Invalid transaction type" },
        { status: 400 }
      );
    }

    if (body.amount !== undefined) {
      const amount = parseFloat(body.amount);
      if (isNaN(amount) || amount <= 0) {
        return NextResponse.json(
          { error: "Amount must be a positive number" },
          { status: 400 }
        );
      }
      body.amount = amount;
    }

    if (body.transactionDate) {
      const transactionDate = new Date(body.transactionDate);
      if (isNaN(transactionDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid transaction date" },
          { status: 400 }
        );
      }
      body.transactionDate = transactionDate;
    }

    // Clean up the data
    const updateData = {
      ...(body.amount !== undefined && { amount: body.amount }),
      ...(body.type && { type: body.type as TransactionType }),
      ...(body.description !== undefined && { description: body.description || null }),
      ...(body.transactionDate && { transactionDate: body.transactionDate }),
      ...(body.isRecurring !== undefined && { isRecurring: Boolean(body.isRecurring) }),
      ...(body.propertyId && { propertyId: body.propertyId }),
      ...(body.categoryId && { categoryId: body.categoryId }),
    };

    const transaction = await updateTransaction(
      id,
      updateData,
      session.user.id
    );

    return NextResponse.json({
      transaction,
      message: "Transaction updated successfully"
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json(
          { error: "Transaction not found or access denied" },
          { status: 404 }
        );
      }
      if (error.message.includes("Property not found")) {
        return NextResponse.json(
          { error: "Property not found or access denied" },
          { status: 404 }
        );
      }
      if (error.message.includes("Category not found")) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canModify = await canMutate(session.user.id);
    if (!canModify) {
      return NextResponse.json(
        { error: "Subscription required to delete transactions" },
        { status: 403 }
      );
    }

    const { id } = await params;
    await softDeleteTransaction(id, session.user.id);

    return NextResponse.json({
      message: "Transaction deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Transaction not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}