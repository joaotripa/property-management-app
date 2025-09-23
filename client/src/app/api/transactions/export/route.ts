import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { getTransactionsForExport } from "@/lib/db/transactions/queries";
import { generateTransactionCSV } from "@/lib/utils/csv";

function generateFileName(filters: {
  type?: string;
  dateFrom?: Date;
  dateTo?: Date;
  propertyId?: string;
  categoryIds?: string[];
  amountMin?: number;
  amountMax?: number;
  search?: string;
}, propertyName?: string): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').replace('T', '').split('.')[0];

  const parts: string[] = ['tax-report'];

  if (filters.type && filters.type !== 'all') {
    parts.push(filters.type.toLowerCase());
  }

  if (propertyName) {
    const sanitizedPropertyName = propertyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    parts.push(sanitizedPropertyName);
  }

  if (filters.dateFrom && filters.dateTo) {
    const fromDate = filters.dateFrom.toISOString().split('T')[0].replace(/-/g, '');
    const toDate = filters.dateTo.toISOString().split('T')[0].replace(/-/g, '');
    parts.push(`${fromDate}-${toDate}`);
  } else if (filters.dateFrom) {
    const fromDate = filters.dateFrom.toISOString().split('T')[0].replace(/-/g, '');
    parts.push(`from-${fromDate}`);
  } else if (filters.dateTo) {
    const toDate = filters.dateTo.toISOString().split('T')[0].replace(/-/g, '');
    parts.push(`until-${toDate}`);
  }

  parts.push(timestamp);

  return `${parts.join('_')}.csv`;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;

    const parseDate = (dateString: string | null): Date | undefined => {
      if (!dateString || !dateString.trim()) {
        return undefined;
      }
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? undefined : date;
    };

    const parseNumber = (numberString: string | null): number | undefined => {
      if (!numberString || !numberString.trim()) {
        return undefined;
      }
      const number = parseFloat(numberString);
      return isNaN(number) ? undefined : number;
    };

    const filters = {
      type: searchParams.get("type") as 'INCOME' | 'EXPENSE' | 'all' | undefined,
      dateFrom: parseDate(searchParams.get("dateFrom")),
      dateTo: parseDate(searchParams.get("dateTo")),
      amountMin: parseNumber(searchParams.get("amountMin")),
      amountMax: parseNumber(searchParams.get("amountMax")),
      categoryIds: searchParams.get("categoryIds")?.split(",").filter(Boolean),
      propertyId: searchParams.get("propertyId") || undefined,
      search: searchParams.get("search") || undefined,
    };

    const transactions = await getTransactionsForExport(session.user.id, filters);

    const propertyName = transactions.length > 0 && filters.propertyId
      ? transactions[0].property.name
      : undefined;

    const csv = generateTransactionCSV(transactions);

    const fileName = generateFileName(filters, propertyName);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting transactions:", error);
    return NextResponse.json(
      { error: "Failed to export transactions" },
      { status: 500 }
    );
  }
}