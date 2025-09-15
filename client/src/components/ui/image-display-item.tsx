"use client";

import Image from "next/image";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImageDisplayItemProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  onError?: () => void;
  onLoad?: () => void;
  aspectRatio?: "video" | "square" | "auto";
}

export function ImageDisplayItem({
  src,
  alt,
  className,
  width,
  height,
  fill = true,
  priority = false,
  onError,
  onLoad,
  aspectRatio = "video",
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

  if (!src) {
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
