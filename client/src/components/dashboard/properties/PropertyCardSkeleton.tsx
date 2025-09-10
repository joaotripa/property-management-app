"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="h-30 w-full bg-muted-foreground/10 animate-pulse" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-muted-foreground/30 animate-pulse rounded" />
          <div className="h-6 w-16 bg-muted-foreground/30 animate-pulse rounded-full" />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="h-4 w-4 bg-muted-foreground/30 animate-pulse rounded" />
          <div className="h-4 w-40 bg-muted-foreground/30 animate-pulse rounded" />
        </div>
      </CardHeader>
      <CardContent className="mb-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="h-4 w-12 bg-muted-foreground/30 animate-pulse rounded" />
            <div className="h-4 w-20 bg-muted-foreground/30 animate-pulse rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-muted-foreground/30 animate-pulse rounded" />
            <div className="h-4 w-16 bg-muted-foreground/30 animate-pulse rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-4 w-16 bg-muted-foreground/30 animate-pulse rounded" />
            <div className="h-4 w-8 bg-muted-foreground/30 animate-pulse rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
