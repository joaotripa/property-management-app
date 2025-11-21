import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/formatting";
import Link from "next/link";

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  amount?: number;
  timestamp: Date;
}

interface RecentActivityProps {
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

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Recent Activity
          </CardTitle>
          <Link href="/dashboard/transactions" passHref>
            <button className="text-sm text-primary/80 hover:text-primary hover:cursor-pointer">
              View All
            </button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No recent activities found.
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const getActivityIcon = (activityType: string) => {
                if (activityType.includes("transaction")) {
                  return activityType.includes("created")
                    ? { bg: "bg-blue-500", bgLight: "bg-blue-500/10" }
                    : { bg: "bg-green-500", bgLight: "bg-green-500/10" };
                } else {
                  return activityType.includes("created")
                    ? { bg: "bg-purple-500", bgLight: "bg-purple-500/10" }
                    : { bg: "bg-orange-500", bgLight: "bg-orange-500/10" };
                }
              };

              return (
                <div
                  key={activity.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 ${getActivityIcon(activity.type).bgLight} rounded-full flex items-center justify-center`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${getActivityIcon(activity.type).bg}`}
                      />
                    </div>
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
