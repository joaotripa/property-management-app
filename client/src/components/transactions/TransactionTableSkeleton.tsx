"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface TransactionTableSkeletonProps {
  showPropertyColumn?: boolean;
  rowCount?: number;
  className?: string;
}

export function TransactionTableSkeleton({
  showPropertyColumn = false,
  rowCount = 5,
  className,
}: TransactionTableSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Amount</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Recurring</TableHead>
              <TableHead>Category</TableHead>
              {showPropertyColumn && <TableHead>Property</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(rowCount)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-20 rounded-4xl !bg-muted/50" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16 rounded-4xl !bg-muted/50" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32 rounded-4xl !bg-muted/50" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24 rounded-4xl !bg-muted/50" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-12 rounded-4xl !bg-muted/50" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20 rounded-4xl !bg-muted/50" />
                </TableCell>
                {showPropertyColumn && (
                  <TableCell>
                    <Skeleton className="h-4 w-28 rounded-4xl !bg-muted/50" />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
