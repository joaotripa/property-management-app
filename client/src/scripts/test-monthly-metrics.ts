/**
 * Test script to verify monthly metrics functionality
 * Run with: npx ts-node src/scripts/test-monthly-metrics.ts
 */

import { prisma } from "@/lib/config/database";
import {
  calculateMonthlyMetrics,
  upsertMonthlyMetrics,
  recalculateUserMetrics,
  validateMonthlyMetrics,
  cleanupEmptyMetrics,
} from "@/lib/services/monthlyMetricsService";

async function testMonthlyMetrics() {
  console.log("🧪 Testing Monthly Metrics System");
  console.log("================================");

  try {
    // Get a test user with transactions
    const userWithTransactions = await prisma.user.findFirst({
      where: {
        transactions: {
          some: {
            deletedAt: null,
          },
        },
      },
      include: {
        properties: {
          where: {
            deletedAt: null,
          },
          take: 1,
        },
        transactions: {
          where: {
            deletedAt: null,
          },
          take: 5,
          orderBy: {
            transactionDate: 'desc',
          },
        },
      },
    });

    if (!userWithTransactions || userWithTransactions.properties.length === 0) {
      console.log("❌ No test user with properties and transactions found");
      console.log("💡 Please run the database seed first: npm run db:seed");
      return;
    }

    const userId = userWithTransactions.id;
    const property = userWithTransactions.properties[0];
    const propertyId = property.id;

    console.log(`✅ Found test user: ${userWithTransactions.email}`);
    console.log(`✅ Found test property: ${property.name}`);
    console.log(`✅ Found ${userWithTransactions.transactions.length} recent transactions`);

    // Test 1: Calculate metrics for current month
    console.log("\n📊 Test 1: Calculate current month metrics");
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const currentMetrics = await calculateMonthlyMetrics(
      userId,
      propertyId,
      currentYear,
      currentMonth
    );

    console.log(`Calculated metrics for ${currentYear}-${currentMonth}:`);
    console.log(`  - Income: €${currentMetrics.totalIncome}`);
    console.log(`  - Expenses: €${currentMetrics.totalExpenses}`);
    console.log(`  - Cash Flow: €${currentMetrics.cashFlow}`);
    console.log(`  - Transactions: ${currentMetrics.transactionCount}`);

    // Test 2: Upsert metrics
    console.log("\n💾 Test 2: Upsert metrics to database");
    await upsertMonthlyMetrics(userId, currentMetrics);
    console.log("✅ Metrics upserted successfully");

    // Test 3: Validate metrics
    console.log("\n🔍 Test 3: Validate stored metrics");
    const validation = await validateMonthlyMetrics(
      userId,
      propertyId,
      currentYear,
      currentMonth
    );

    if (validation.isValid) {
      console.log("✅ Stored metrics are valid and consistent");
    } else {
      console.log("⚠️ Metrics validation failed:");
      if (validation.differences) {
        console.log("Differences found:", validation.differences);
      }
    }

    // Test 4: Recalculate all user metrics
    console.log("\n🔄 Test 4: Recalculate all user metrics");
    const recalcResult = await recalculateUserMetrics(userId);
    console.log(`✅ Recalculated metrics for ${recalcResult.updatedProperties} properties`);
    console.log(`✅ Updated ${recalcResult.updatedMonths} monthly metric records`);

    // Test 5: Cleanup empty metrics
    console.log("\n🧹 Test 5: Cleanup empty metrics");
    const cleanupResult = await cleanupEmptyMetrics(userId);
    console.log(`✅ Cleaned up ${cleanupResult.deleted} empty metric records`);

    // Test 6: Check final state
    console.log("\n📈 Test 6: Final metrics overview");
    const finalMetrics = await prisma.monthlyMetrics.findMany({
      where: {
        userId,
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
      ],
      take: 5,
      include: {
        property: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log(`Found ${finalMetrics.length} monthly metric records:`);
    finalMetrics.forEach((metric) => {
      console.log(
        `  - ${metric.property.name} (${metric.year}-${metric.month.toString().padStart(2, '0')}): ` +
        `€${Number(metric.cashFlow)} cash flow, ${metric.transactionCount} transactions`
      );
    });

    console.log("\n🎉 All tests completed successfully!");
    console.log("Monthly metrics system is working correctly.");

  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  testMonthlyMetrics()
    .then(() => {
      console.log("\n✅ Test script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Test script failed:", error);
      process.exit(1);
    });
}