import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactionStats } from "@/hooks/useTransactionStats";
import { TransactionFilters } from "@/types/transactions";
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionStatsProps {
  filters: TransactionFilters;
}

const TransactionStats = ({ filters }: TransactionStatsProps) => {
  const {
    stats,
    loading: statsLoading,
    error: statsError,
  } = useTransactionStats(filters);

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">
            {statsLoading ? (
              <Skeleton className="h-8 w-24 rounded-full !bg-muted/50" />
            ) : statsError ? (
              "—"
            ) : (
              `€${(stats?.totalIncome || 0).toLocaleString()}`
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {statsLoading ? (
              <Skeleton className="h-8 w-24 rounded-full !bg-muted/50" />
            ) : statsError ? (
              "—"
            ) : (
              `€${(stats?.totalExpenses || 0).toLocaleString()}`
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="sm:col-span-2 lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Net Income</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              (stats?.netIncome || 0) >= 0 ? "text-success" : "text-destructive"
            }`}
          >
            {statsLoading ? (
              <Skeleton className="h-8 w-24 rounded-full !bg-muted/50" />
            ) : statsError ? (
              "—"
            ) : (
              `€${(stats?.netIncome || 0).toLocaleString()}`
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionStats;
