"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { ImageDisplayItem } from "@/components/ui/image-display-item";
import { Carousel, CarouselContent, CarouselItem } from "./carousel";
import type { PropertyImage } from "@prisma/client";

export interface ThumbnailCarouselProps {
  images: PropertyImage[];
  currentIndex: number;
  onThumbnailClick: (imageId: string) => void;
  className?: string;
  thumbnailSize?: number;
  maxVisibleThumbnails?: number;
  handleImageLoad: (imageId: string) => void;
  handleImageError: (imageId: string) => void;
  hasImageError: (imageId: string) => boolean;
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
    image,
    index,
  }: {
    image: PropertyImage;
    index: number;
  }) => (
    <button
      type="button"
      onClick={() => onThumbnailClick(image.id)}
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
        src={image.url}
        alt={`Thumbnail ${index + 1}`}
        fill
        aspectRatio="square"
        className={cn(shouldUseCarousel ? "w-full h-full" : "", "rounded-lg")}
        onLoad={() => handleImageLoad(image.id)}
        onError={
          hasImageError(image.id) ? undefined : () => handleImageError(image.id)
        }
        hasError={hasImageError(image.id)}
        iconSize="sm"
      />
    </button>
  );

  if (!shouldUseCarousel) {
    return (
      <div className={cn("flex gap-2 overflow-x-auto pb-2", className)}>
        {images.map((image, index) => (
          <ThumbnailButton key={image.id} image={image} index={index} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {images.map((image, index) => (
            <CarouselItem
              key={image.id}
              className="pl-2 basis-auto"
              style={{ flexBasis: `${thumbnailSize + 8}px` }}
            >
              <div style={{ width: thumbnailSize, height: thumbnailSize }}>
                <ThumbnailButton image={image} index={index} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const ThumbnailCarousel = memo(ThumbnailCarouselComponent);
