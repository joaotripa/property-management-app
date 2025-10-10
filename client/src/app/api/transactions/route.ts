import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTransactions } from "@/lib/db/transactions/queries";
import { createTransaction } from "@/lib/db/transactions/mutations";
import { TransactionType } from "@/types/transactions";
import { canMutate } from "@/lib/stripe/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;

    // Parse pagination parameters
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") ?? "25", 10)));
    const offset = (page - 1) * limit;

    // Parse filter parameters
    const filters = {
      dateFrom: searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom")!) : undefined,
      dateTo: searchParams.get("dateTo") ? new Date(searchParams.get("dateTo")!) : undefined,
      type: searchParams.get("type") as TransactionType | "all" | null,
      amountMin: searchParams.get("amountMin") ? parseFloat(searchParams.get("amountMin")!) : undefined,
      amountMax: searchParams.get("amountMax") ? parseFloat(searchParams.get("amountMax")!) : undefined,
      categoryIds: searchParams.get("categoryIds")?.split(",").filter(Boolean),
      propertyId: searchParams.get("propertyId") || undefined,
      search: searchParams.get("search") || undefined,
      sortBy: (searchParams.get("sortBy") || "transactionDate") as "transactionDate" | "amount" | "type" | "category",
      sortOrder: (searchParams.get("sortOrder") || "desc") as "asc" | "desc",
    };

    // Clean up type filter
    if (filters.type === "all") {
      filters.type = null;
    }

    const result = await getTransactions(session.user.id, {
      ...filters,
      type: filters.type as TransactionType | undefined,
      limit,
      offset,
    });

    const totalPages = Math.ceil(result.totalCount / limit);

    return NextResponse.json({
      transactions: result.transactions,
      totalCount: result.totalCount,
      totalPages,
      currentPage: page,
      pageSize: limit,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canModify = await canMutate(session.user.id);
    if (!canModify) {
      return NextResponse.json(
        { error: "Subscription required to create transactions" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = ["amount", "type", "transactionDate", "propertyId", "categoryId"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate transaction type
    if (!Object.values(TransactionType).includes(body.type)) {
      return NextResponse.json(
        { error: "Invalid transaction type" },
        { status: 400 }
      );
    }

    // Validate amount
    const amount = parseFloat(body.amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    // Validate date
    const transactionDate = new Date(body.transactionDate);
    if (isNaN(transactionDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid transaction date" },
        { status: 400 }
      );
    }

    const transactionData = {
      amount,
      type: body.type as TransactionType,
      description: body.description || undefined,
      transactionDate,
      isRecurring: Boolean(body.isRecurring),
      propertyId: body.propertyId,
      categoryId: body.categoryId,
    };

    const transaction = await createTransaction(transactionData, session.user.id);

    return NextResponse.json(
      { 
        transaction,
        message: "Transaction created successfully"
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating transaction:", error);
    
    if (error instanceof Error) {
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