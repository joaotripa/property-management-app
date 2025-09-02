"use client";

import { Loader2 } from "lucide-react";
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
        overlay && "absolute inset-0 bg-background/80 backdrop-blur-sm z-10",
        className
      )}
    >
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );
}
