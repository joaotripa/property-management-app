"use client";

import { cn } from "@/lib/utils";

interface ImageLoadingProps {
  className?: string;
  overlay?: boolean;
}

export function ImageLoading({
  className,
  overlay = false,
}: ImageLoadingProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        overlay && "absolute inset-0 bg-background/90 z-10",
        className
      )}
    >
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary opacity-80"></div>
      </div>
    </div>
  );
}
