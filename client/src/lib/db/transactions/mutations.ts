import { prisma } from "@/lib/prisma";
import { Transaction } from "@/types/transactions";

/**
 * Soft delete all transactions for a specific property
 */
export async function softDeletePropertyTransactions(
  propertyId: string,
  userId: string
): Promise<{ count: number }> {
  try {
    // Verify property ownership
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        userId,
        deletedAt: null,
      },
    });

    if (!property) {
      throw new Error('Property not found or access denied');
    }

    // Soft delete all transactions for the property
    const result = await prisma.transaction.updateMany({
      where: {
        propertyId,
        userId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return { count: result.count };
  } catch (error) {
    console.error('Error soft deleting property transactions:', error);
    throw new Error('Failed to delete property transactions');
  }
}

/**
 * Restore all soft-deleted transactions for a specific property
 */
export async function restorePropertyTransactions(
  propertyId: string,
  userId: string
): Promise<{ count: number }> {
  try {
    // Verify property ownership
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        userId,
      },
    });

    if (!property) {
      throw new Error('Property not found or access denied');
    }

    // Restore all soft-deleted transactions for the property
    const result = await prisma.transaction.updateMany({
      where: {
        propertyId,
        userId,
        deletedAt: {
          not: null,
        },
      },
      data: {
        deletedAt: null,
        updatedAt: new Date(),
      },
    });

    return { count: result.count };
  } catch (error) {
    console.error('Error restoring property transactions:', error);
    throw new Error('Failed to restore property transactions');
  }
}

/**
 * Soft delete a single transaction
 */
export async function softDeleteTransaction(
  transactionId: string,
  userId: string
): Promise<void> {
  try {
    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
        deletedAt: null,
      },
    });

    if (!existingTransaction) {
      throw new Error('Transaction not found or access denied');
    }

    await prisma.transaction.update({
      where: {
        id: transactionId,
      },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error soft deleting transaction:', error);
    throw new Error('Failed to delete transaction');
  }
}

/**
 * Restore a soft-deleted transaction
 */
export async function restoreTransaction(
  transactionId: string,
  userId: string
): Promise<Transaction> {
  try {
    // Check if transaction exists and belongs to user (including soft-deleted)
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
        deletedAt: {
          not: null,
        },
      },
    });

    if (!existingTransaction) {
      throw new Error('Transaction not found or access denied');
    }

    const transaction = await prisma.transaction.update({
      where: {
        id: transactionId,
      },
      data: {
        deletedAt: null,
        updatedAt: new Date(),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true,
            description: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    // Transform Decimal amounts to numbers for frontend
    return {
      ...transaction,
      amount: Number(transaction.amount),
      description: transaction.description ?? undefined,
      category: transaction.category
        ? { ...transaction.category, description: transaction.category.description ?? undefined }
        : undefined,
    };
  } catch (error) {
    console.error('Error restoring transaction:', error);
    throw new Error('Failed to restore transaction');
  }
}

/**
 * Get count of transactions for a property (including soft-deleted)
 */
export async function getPropertyTransactionCount(
  propertyId: string,
  userId: string
): Promise<{ active: number; deleted: number; total: number }> {
  try {
    const [activeCount, deletedCount] = await Promise.all([
      prisma.transaction.count({
        where: {
          propertyId,
          userId,
          deletedAt: null,
        },
      }),
      prisma.transaction.count({
        where: {
          propertyId,
          userId,
          deletedAt: {
            not: null,
          },
        },
      }),
    ]);

    return {
      active: activeCount,
      deleted: deletedCount,
      total: activeCount + deletedCount,
    };
  } catch (error) {
    console.error('Error getting property transaction count:', error);
    throw new Error('Failed to get transaction count');
  }
}