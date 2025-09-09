class ActivityServiceError extends Error {
  constructor(public message: string, public status?: number, public details?: unknown) {
    super(message);
    this.name = 'ActivityServiceError';
  }
}

const API_BASE = '/api/activities';

async function handleApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  
  if (!response.ok) {
    throw new ActivityServiceError(
      data.error || `API request failed with status ${response.status}`,
      response.status,
      data.details
    );
  }
  
  return data;
}

export type ActivityType = 'transaction_created' | 'transaction_updated' | 'property_created' | 'property_updated';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  entityId: string;
  entityName?: string;
  amount?: number;
}

export interface RecentActivitiesResponse {
  activities: Activity[];
}

/**
 * Get recent activities (last 3 activities across transactions and properties)
 */
export async function getRecentActivities(limit: number = 3): Promise<Activity[]> {
  try {
    const response = await fetch(`${API_BASE}/recent?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = await handleApiResponse<RecentActivitiesResponse>(response);
    return result.activities;
  } catch (error) {
    if (error instanceof ActivityServiceError) {
      throw error;
    }
    throw new ActivityServiceError(
      'Failed to fetch recent activities',
      undefined,
      error
    );
  }
}

export { ActivityServiceError };