import { prisma } from "@/lib/prisma";
import { ActivityType, Activity } from "@/lib/services/activityService";

/**
 * Get recent activities for a user from transactions and properties
 */
export async function getRecentActivitiesForUser(
  userId: string,
  limit: number = 3
): Promise<Activity[]> {
  try {
    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        property: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { updatedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit * 2, // Get more to have variety
    });

    // Get recent properties  
    const recentProperties = await prisma.property.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: [
        { updatedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit * 2, // Get more to have variety
    });

    // Convert to activities
    const activities: Activity[] = [];

    // Add transaction activities
    recentTransactions.forEach((transaction) => {
      const wasUpdated = transaction.updatedAt.getTime() > transaction.createdAt.getTime() + 1000; // 1 second tolerance
      const activityType: ActivityType = wasUpdated ? 'transaction_updated' : 'transaction_created';
      const timestamp = wasUpdated ? transaction.updatedAt.toISOString() : transaction.createdAt.toISOString();

      activities.push({
        id: `transaction_${transaction.id}`,
        type: activityType,
        title: wasUpdated ? 'Transaction updated' : 'New transaction',
        description: `${transaction.property?.name || 'Property'} - ${transaction.description || transaction.type.toLowerCase()}`,
        timestamp,
        entityId: transaction.id,
        entityName: transaction.property?.name,
        amount: Number(transaction.amount),
      });
    });

    // Add property activities
    recentProperties.forEach((property) => {
      const wasUpdated = property.updatedAt.getTime() > property.createdAt.getTime() + 1000; // 1 second tolerance
      const activityType: ActivityType = wasUpdated ? 'property_updated' : 'property_created';
      const timestamp = wasUpdated ? property.updatedAt.toISOString() : property.createdAt.toISOString();

      activities.push({
        id: `property_${property.id}`,
        type: activityType,
        title: wasUpdated ? 'Property updated' : 'New property added',
        description: `${property.name} - ${property.address}`,
        timestamp,
        entityId: property.id,
        entityName: property.name,
      });
    });

    // Sort by timestamp descending and take the most recent
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return sortedActivities;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw new Error('Failed to fetch recent activities');
  }
}