"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { ImageDisplayItem } from "./image-display-item";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel";

export interface ThumbnailCarouselProps {
  images: string[];
  currentIndex: number;
  onThumbnailClick: (index: number) => void;
  className?: string;
  thumbnailSize?: number;
  maxVisibleThumbnails?: number;
  handleImageLoad: (index: number) => void;
  handleImageError: (index: number) => void;
  hasImageError: (index: number) => boolean;
}

const ThumbnailCarouselComponent = ({
  images,
  currentIndex,
  onThumbnailClick,
  className,
  thumbnailSize = 64,
  maxVisibleThumbnails = 6,
  handleImageLoad,
  handleImageError,
  hasImageError,
}: ThumbnailCarouselProps) => {
  const shouldUseCarousel = images.length > maxVisibleThumbnails;

  const ThumbnailButton = ({
    imageUrl,
    index,
  }: {
    imageUrl: string;
    index: number;
  }) => (
    <button
      onClick={() => onThumbnailClick(index)}
      className={cn(
        "flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors hover:border-primary/50",
        currentIndex === index ? "border-primary" : "border-transparent",
        shouldUseCarousel ? "w-full h-full" : ""
      )}
      style={
        !shouldUseCarousel
          ? { width: thumbnailSize, height: thumbnailSize }
          : undefined
      }
    >
      <ImageDisplayItem
        src={imageUrl}
        alt={`Thumbnail ${index + 1}`}
        fill
        aspectRatio="square"
        className={cn(shouldUseCarousel ? "w-full h-full" : "", "rounded-lg")}
        onLoad={() => handleImageLoad(index)}
        onError={
          hasImageError(index) ? undefined : () => handleImageError(index)
        }
        hasError={hasImageError(index)}
        iconSize="sm"
      />
    </button>
  );

  if (!shouldUseCarousel) {
    return (
      <div className={cn("flex gap-2 overflow-x-auto pb-2", className)}>
        {images.map((imageUrl, index) => (
          <ThumbnailButton key={imageUrl} imageUrl={imageUrl} index={index} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {images.map((imageUrl, index) => (
            <CarouselItem
              key={imageUrl}
              className="pl-2 basis-auto"
              style={{ flexBasis: `${thumbnailSize + 8}px` }}
            >
              <div style={{ width: thumbnailSize, height: thumbnailSize }}>
                <ThumbnailButton imageUrl={imageUrl} index={index} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="left-0 size-7 bg-background/80 backdrop-blur-sm hover:bg-background/90 border-border" />
        <CarouselNext className="right-0 size-7 bg-background/80 backdrop-blur-sm hover:bg-background/90 border-border" />
      </Carousel>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const ThumbnailCarousel = memo(ThumbnailCarouselComponent);
