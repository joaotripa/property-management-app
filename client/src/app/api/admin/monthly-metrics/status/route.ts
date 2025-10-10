import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/config/database";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const propertyId = searchParams.get("propertyId");

    // Base where clause
    const baseWhere = {
      userId: session.user.id,
      ...(propertyId && { propertyId }),
    };

    // Get monthly metrics statistics
    const [
      totalMetrics,
      propertiesWithMetrics,
      dateRange,
      recentMetrics,
      zeroMetrics,
      transactionStats
    ] = await Promise.all([
      // Total number of monthly metric records
      prisma.monthlyMetrics.count({
        where: baseWhere,
      }),

      // Number of properties with metrics
      prisma.monthlyMetrics.groupBy({
        by: ['propertyId'],
        where: baseWhere,
        _count: {
          propertyId: true,
        },
      }),

      // Date range of metrics
      prisma.monthlyMetrics.aggregate({
        where: baseWhere,
        _min: {
          year: true,
          month: true,
          createdAt: true,
        },
        _max: {
          year: true,
          month: true,
          updatedAt: true,
        },
      }),

      // Most recent metrics (last 5)
      prisma.monthlyMetrics.findMany({
        where: baseWhere,
        orderBy: [
          { year: 'desc' },
          { month: 'desc' },
          { updatedAt: 'desc' },
        ],
        take: 5,
        include: {
          property: {
            select: {
              name: true,
            },
          },
        },
      }),

      // Count of metrics with zero values
      prisma.monthlyMetrics.count({
        where: {
          ...baseWhere,
          totalIncome: 0,
          totalExpenses: 0,
          transactionCount: 0,
        },
      }),

      // Transaction statistics for comparison
      prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          deletedAt: null,
          ...(propertyId && { propertyId }),
        },
        _count: {
          id: true,
        },
        _min: {
          transactionDate: true,
        },
        _max: {
          transactionDate: true,
        },
      }),
    ]);

    // Format the response
    const status = {
      overview: {
        totalMonthlyMetrics: totalMetrics,
        propertiesWithMetrics: propertiesWithMetrics.length,
        metricsWithZeroValues: zeroMetrics,
        totalTransactions: transactionStats._count.id || 0,
      },
      dateRange: {
        earliestMetrics: dateRange._min.year && dateRange._min.month
          ? `${dateRange._min.year}-${dateRange._min.month.toString().padStart(2, '0')}`
          : null,
        latestMetrics: dateRange._max.year && dateRange._max.month
          ? `${dateRange._max.year}-${dateRange._max.month.toString().padStart(2, '0')}`
          : null,
        earliestTransaction: transactionStats._min.transactionDate,
        latestTransaction: transactionStats._max.transactionDate,
        lastUpdated: dateRange._max.updatedAt,
      },
      recentMetrics: recentMetrics.map(metric => ({
        propertyId: metric.propertyId,
        propertyName: metric.property.name,
        period: `${metric.year}-${metric.month.toString().padStart(2, '0')}`,
        totalIncome: Number(metric.totalIncome),
        totalExpenses: Number(metric.totalExpenses),
        cashFlow: Number(metric.cashFlow),
        transactionCount: metric.transactionCount,
        updatedAt: metric.updatedAt,
      })),
      properties: propertiesWithMetrics.map(prop => ({
        propertyId: prop.propertyId,
        metricsCount: prop._count.propertyId,
      })),
    };

    return NextResponse.json({
      status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error getting monthly metrics status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}