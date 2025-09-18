import { prisma } from "@/lib/config/database";
import { ActivityType, Activity } from "@/lib/services/client/activityService";
import { toCamelCase } from "@/lib/utils/index";

/**
 * Get recent activities for a user from transactions and properties
 */
export async function getRecentActivitiesForUser(
  userId: string,
  limit: number = 3
): Promise<Activity[]> {
  try {

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
      take: limit * 2,
    });

    const recentProperties = await prisma.property.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: [
        { updatedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit * 2, 
    });

    const activities: Activity[] = [];

    recentTransactions.forEach((transaction) => {
      const wasUpdated = transaction.updatedAt.getTime() > transaction.createdAt.getTime() + 1000; // 1 second tolerance
      const activityType: ActivityType = wasUpdated ? 'transaction_updated' : 'transaction_created';
      const timestamp = wasUpdated ? transaction.updatedAt.toISOString() : transaction.createdAt.toISOString();

      activities.push({
        id: `transaction_${transaction.id}`,
        type: activityType,
        title: `${(
          transaction.description?.trim() || toCamelCase(transaction.type)
        )} (${wasUpdated ? 'Updated' : 'New'})`,
        description: `${transaction.property?.name || 'Property'}`,
        timestamp,
        entityId: transaction.id,
        entityName: transaction.property?.name,
        amount: Number(transaction.amount),
      });
    });

    recentProperties.forEach((property) => {
      const wasUpdated = property.updatedAt.getTime() > property.createdAt.getTime() + 1000; // 1 second tolerance
      const activityType: ActivityType = wasUpdated ? 'property_updated' : 'property_created';
      const timestamp = wasUpdated ? property.updatedAt.toISOString() : property.createdAt.toISOString();

      activities.push({
        id: `property_${property.id}`,
        type: activityType,
        title: `Property ${property.name} (${wasUpdated ? 'Updated' : 'New'})`,
        description: `${toCamelCase(String(property.type))} - ${property.address}`,
        timestamp,
        entityId: property.id,
        entityName: property.name,
      });
    });

    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return sortedActivities;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw new Error('Failed to fetch recent activities');
  }
}