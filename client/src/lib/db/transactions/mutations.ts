import { prisma } from "@/lib/config/database";
import { TransactionType } from "@prisma/client";
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
 * Bulk soft delete multiple transactions
 */
export async function bulkSoftDeleteTransactions(
  transactionIds: string[],
  userId: string
): Promise<{
  deletedCount: number;
  failedCount: number;
  failedIds: string[];
}> {
  try {
    // Validate that all transactions exist and belong to the user
    const existingTransactions = await prisma.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId,
        deletedAt: null,
      },
      select: { id: true },
    });

    const foundIds = existingTransactions.map(t => t.id);
    const failedIds = transactionIds.filter(id => !foundIds.includes(id));

    if (foundIds.length === 0) {
      throw new Error('No valid transactions found or access denied');
    }

    // Perform bulk soft delete for valid transactions
    const result = await prisma.transaction.updateMany({
      where: {
        id: { in: foundIds },
        userId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      deletedCount: result.count,
      failedCount: failedIds.length,
      failedIds,
    };
  } catch (error) {
    console.error('Error bulk soft deleting transactions:', error);
    throw new Error('Failed to bulk delete transactions');
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
    } as Transaction;
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

/**
 * Create a new transaction
 */
export async function createTransaction(
  transactionData: {
    amount: number;
    type: TransactionType;
    description?: string;
    transactionDate: Date;
    isRecurring: boolean;
    propertyId: string;
    categoryId: string;
  },
  userId: string
): Promise<Transaction> {
  try {
    // Verify property ownership
    const property = await prisma.property.findFirst({
      where: {
        id: transactionData.propertyId,
        userId,
        deletedAt: null,
      },
    });

    if (!property) {
      throw new Error('Property not found or access denied');
    }

    // Verify category exists
    const category = await prisma.category.findFirst({
      where: {
        id: transactionData.categoryId,
        isActive: true,
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: transactionData.amount,
        type: transactionData.type,
        description: transactionData.description,
        transactionDate: transactionData.transactionDate,
        isRecurring: transactionData.isRecurring,
        propertyId: transactionData.propertyId,
        categoryId: transactionData.categoryId,
        userId,
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
    } as Transaction;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw new Error('Failed to create transaction');
  }
}

/**
 * Update an existing transaction
 */
export async function updateTransaction(
  transactionId: string,
  updateData: {
    amount?: number;
    type?: TransactionType;
    description?: string | null;
    transactionDate?: Date;
    isRecurring?: boolean;
    propertyId?: string;
    categoryId?: string;
  },
  userId: string
): Promise<Transaction> {
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

    // Verify property ownership if property is being changed
    if (updateData.propertyId) {
      const property = await prisma.property.findFirst({
        where: {
          id: updateData.propertyId,
          userId,
          deletedAt: null,
        },
      });

      if (!property) {
        throw new Error('Property not found or access denied');
      }
    }

    // Verify category exists if category is being changed
    if (updateData.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: updateData.categoryId,
          isActive: true,
        },
      });

      if (!category) {
        throw new Error('Category not found');
      }
    }

    const transaction = await prisma.transaction.update({
      where: {
        id: transactionId,
      },
      data: {
        ...updateData,
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
    } as Transaction;
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw new Error('Failed to update transaction');
  }
}

/**
 * Get a single transaction by ID
 */
export async function getTransactionById(
  transactionId: string,
  userId: string
): Promise<Transaction | null> {
  try {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
        deletedAt: null,
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

    if (!transaction) {
      return null;
    }

    // Transform Decimal amounts to numbers for frontend
    return {
      ...transaction,
      amount: Number(transaction.amount),
      description: transaction.description ?? undefined,
      category: transaction.category
        ? { ...transaction.category, description: transaction.category.description ?? undefined }
        : undefined,
    } as Transaction;
  } catch (error) {
    console.error('Error getting transaction by ID:', error);
    throw new Error('Failed to get transaction');
  }
}