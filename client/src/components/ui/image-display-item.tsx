"use client";

import Image from "next/image";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { Loading } from "@/components/ui/loading";

export interface ImageDisplayItemProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  isLoading?: boolean;
  onError?: () => void;
  onLoad?: () => void;
  aspectRatio?: "video" | "square" | "auto";
  hasError?: boolean; // New prop to indicate permanent error state
}

export function ImageDisplayItem({
  src,
  alt,
  className,
  width,
  height,
  fill = true,
  priority = false,
  isLoading = false,
  onError,
  onLoad,
  aspectRatio = "video",
  hasError = false,
}: ImageDisplayItemProps) {
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "square":
        return "aspect-square";
      case "video":
        return "aspect-video";
      default:
        return "";
    }
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          "bg-muted/20 flex items-center justify-center animate-pulse",
          !fill && getAspectRatioClass(),
          fill && "w-full h-full",
          className
        )}
      >
        <Loading />
      </div>
    );
  }

  // If image has permanently failed or no src, show placeholder immediately
  if (!src || hasError) {
    return (
      <div
        className={cn(
          "bg-muted/20 flex items-center justify-center",
          !fill && getAspectRatioClass(),
          fill && "w-full h-full",
          className
        )}
      >
        <Home className="w-8 h-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative",
        !fill && getAspectRatioClass(),
        fill && "w-full h-full",
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className="object-cover"
        sizes={
          fill
            ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            : undefined
        }
        onError={onError}
        onLoad={onLoad}
        priority={priority}
      />
    </div>
  );
}
