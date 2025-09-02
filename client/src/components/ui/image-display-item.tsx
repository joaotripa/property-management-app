"use client";

import { useState } from "react";
import Image from "next/image";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageLoading } from "@/components/ui/image-loading";

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
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "bg-muted-foreground/10 flex items-center justify-center",
          !fill && getAspectRatioClass(),
          fill && "w-full h-full",
          className
        )}
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-primary/60 rounded-full flex items-center justify-center mx-auto mb-2">
            <Home className="w-6 h-6 text-background" />
          </div>
          <p className="text-xs text-muted-foreground">Image not available</p>
        </div>
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
        onError={handleImageError}
        onLoad={handleImageLoad}
        priority={priority}
      />

      {/* Loading overlay */}
      {isLoading && <ImageLoading overlay />}
    </div>
  );
}
