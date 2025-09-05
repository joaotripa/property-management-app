import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPropertyTransactions, validatePropertyAccess } from "@/lib/db/db-queries";
import { TransactionFilters } from "@/types/transactions";
import { TransactionType } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params as required by Next.js 15+
    const { id } = await params;
    const propertyId = id;
    const userId = session.user.id;

    // Validate that the user owns this property
    const hasAccess = await validatePropertyAccess(propertyId, userId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    
    // Build filters from query parameters
    const filters: TransactionFilters = {};
    
    // Date filters
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    if (dateFrom) {
      filters.dateFrom = new Date(dateFrom);
    }
    if (dateTo) {
      filters.dateTo = new Date(dateTo);
    }

    // Type filter
    const type = searchParams.get('type');
    if (type && (type === TransactionType.INCOME || type === TransactionType.EXPENSE)) {
      filters.type = type;
    }

    // Amount filters
    const amountMin = searchParams.get('amountMin');
    const amountMax = searchParams.get('amountMax');
    if (amountMin) {
      const parsed = parseFloat(amountMin);
      if (!isNaN(parsed)) {
        filters.amountMin = parsed;
      }
    }
    if (amountMax) {
      const parsed = parseFloat(amountMax);
      if (!isNaN(parsed)) {
        filters.amountMax = parsed;
      }
    }

    // Category filter
    const categoryIds = searchParams.get('categoryIds');
    if (categoryIds) {
      filters.categoryIds = categoryIds.split(',').filter(Boolean);
    }

    // Recurring filter
    const isRecurring = searchParams.get('isRecurring');
    if (isRecurring === 'true' || isRecurring === 'false') {
      filters.isRecurring = isRecurring === 'true';
    }

    // Search filter
    const search = searchParams.get('search');
    if (search) {
      filters.search = search;
    }

    // Sort parameters
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder');
    if (sortBy) {
      filters.sortBy = sortBy as "transactionDate" | "amount" | "type";
    }
    if (sortOrder && (sortOrder === 'asc' || sortOrder === 'desc')) {
      filters.sortOrder = sortOrder;
    }

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    // Fetch transactions
    const result = await getPropertyTransactions(
      propertyId,
      userId,
      {
        ...filters,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }
    );

    return NextResponse.json({
      transactions: result.transactions,
      totalCount: result.totalCount,
      totalPages: Math.ceil(result.totalCount / pageSize),
      currentPage: page,
    });

  } catch (error) {
    console.error("Error fetching property transactions:", error);
    
    // Return appropriate error response
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}