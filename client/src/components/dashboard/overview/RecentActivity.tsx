"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity as ActivityIcon } from "lucide-react";
import { getRecentActivities, Activity } from "@/lib/services/activityService";
import { formatCurrency } from "@/components/dashboard/analytics/KPICards";

interface RecentActivityData {
  activities: Activity[];
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return "just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export function RecentActivity() {
  const [data, setData] = useState<RecentActivityData>({ activities: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        setIsLoading(true);
        setError("");

        const activities = await getRecentActivities(3);

        setData({ activities });
      } catch (err) {
        console.error("Error fetching recent activity:", err);
        setError("Failed to load recent activity");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ActivityIcon className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive py-8">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Recent Activity
          </CardTitle>
          <button className="text-sm text-blue-600 hover:text-blue-800">
            View All
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        ) : data.activities.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No recent activities found.
          </div>
        ) : (
          <div className="space-y-4">
            {data.activities.map((activity) => {
              const getActivityIcon = (activityType: string) => {
                if (activityType.includes("transaction")) {
                  return activityType.includes("created")
                    ? "bg-blue-500"
                    : "bg-green-500";
                } else {
                  return activityType.includes("created")
                    ? "bg-purple-500"
                    : "bg-orange-500";
                }
              };

              return (
                <div
                  key={activity.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${getActivityIcon(activity.type)}`}
                    />
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                        {activity.amount &&
                          ` - ${formatCurrency(activity.amount)}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatTimeAgo(new Date(activity.timestamp))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
