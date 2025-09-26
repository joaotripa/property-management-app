import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/formatting";

interface PropertyPerformanceCardProps {
  metrics: {
    income: number;
    expenses: number;
    cashFlow: number;
    roi: number;
  } | null;
}

export function PropertyPerformanceCard({
  metrics,
}: PropertyPerformanceCardProps) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Current Month Performance</CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-0">
        <div className="grid grid-cols-1 sm:grid-cols-3">
          <div className="flex flex-col gap-2 p-6 items-center">
            <p className="text-sm text-muted-foreground">Income</p>
            <p className="text-3xl font-semibold ">
              {formatCurrency(metrics?.income || 0)}
            </p>
          </div>

          <div className="flex flex-col gap-2 p-6 items-center">
            <p className="text-sm text-muted-foreground">Expenses</p>
            <p className="text-3xl font-semibold">
              {formatCurrency(metrics?.expenses || 0)}
            </p>
          </div>

          <div className="flex flex-col gap-2 p-6 items-center">
            <p className="text-sm text-muted-foreground">Cash Flow</p>
            <p
              className={`text-3xl font-semibold ${
                (metrics?.cashFlow || 0) >= 0
                  ? "text-success"
                  : "text-destructive"
              }`}
            >
              {(metrics?.cashFlow || 0) >= 0 ? "+" : "-"}
              {formatCurrency(Math.abs(metrics?.cashFlow || 0))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}