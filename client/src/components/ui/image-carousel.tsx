"use client";

import { useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageDisplayItem } from "./image-display-item";
import { ThumbnailCarousel } from "./thumbnail-carousel";
import { ImageLoading } from "./image-loading";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel";
import {
  useImageCarouselSync,
  useImageLoading,
} from "@/hooks/useImageCarousel";

export interface ImageCarouselProps {
  images: string[];
  propertyName?: string;
  className?: string;
  showThumbnails?: boolean;
  aspectRatio?: "video" | "square" | "auto";
  onImageChange?: (index: number) => void;
  isLoading?: boolean;
}

export function ImageCarousel({
  images,
  propertyName = "Property",
  className,
  showThumbnails = true,
  aspectRatio = "video",
  onImageChange,
  isLoading = false,
}: ImageCarouselProps) {
  const { setMainApi, currentIndex, onThumbnailClick } = useImageCarouselSync();

  const { handleImageLoad, handleImageError, hasImageError } = useImageLoading(images);

  const getAspectRatioClass = useCallback(() => {
    switch (aspectRatio) {
      case "square":
        return "aspect-square";
      case "video":
        return "aspect-video";
      default:
        return "";
    }
  }, [aspectRatio]);

  useEffect(() => {
    onImageChange?.(currentIndex);
  }, [currentIndex, onImageChange]);

  if (isLoading) {
    return (
      <div className={cn("relative", getAspectRatioClass(), className)}>
        <ImageLoading className={cn("rounded-lg", getAspectRatioClass())} />
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className={cn("relative", getAspectRatioClass(), className)}>
        <ImageDisplayItem
          src=""
          alt="No images available"
          className="rounded-lg"
          fill
          aspectRatio={aspectRatio}
        />
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        <div
          className={cn(
            "relative rounded-lg overflow-hidden w-full",
            getAspectRatioClass()
          )}
        >
          <ImageDisplayItem
            src={images[0]}
            alt={propertyName}
            fill
            priority
            onLoad={() => handleImageLoad(0)}
            onError={hasImageError(0) ? undefined : () => handleImageError(0)}
            hasError={hasImageError(0)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Main Image Carousel */}
      <div className="relative">
        <Carousel
          setApi={setMainApi}
          opts={{
            align: "center",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {images.map((imageUrl, index) => (
              <CarouselItem key={imageUrl}>
                <div
                  className={cn(
                    "relative rounded-lg overflow-hidden w-full",
                    getAspectRatioClass()
                  )}
                >
                  <ImageDisplayItem
                    src={imageUrl}
                    alt={`${propertyName} - Image ${index + 1}`}
                    fill
                    priority={index === 0}
                    onLoad={() => handleImageLoad(index)}
                    onError={hasImageError(index) ? undefined : () => handleImageError(index)}
                    hasError={hasImageError(index)}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Custom Navigation Buttons */}
          <CarouselPrevious className="left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-primary/90 text-primary hover:text-background border-border size-10">
            <ChevronLeft className="size-5" />
          </CarouselPrevious>

          <CarouselNext className="right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-primary/90 text-primary hover:text-background border-border size-10">
            <ChevronRight className="w-5 h-5" />
          </CarouselNext>
        </Carousel>

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-background/80 text-primary px-3 py-1 rounded-full text-xs backdrop-blur-sm border border-border">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {showThumbnails && images.length > 1 && (
        <ThumbnailCarousel
          images={images}
          currentIndex={currentIndex}
          onThumbnailClick={onThumbnailClick}
          handleImageLoad={handleImageLoad}
          handleImageError={handleImageError}
          hasImageError={hasImageError}
        />
      )}

      {/* Dot Indicators (alternative to thumbnails) */}
      {!showThumbnails && images.length > 1 && (
        <div className="flex justify-center gap-2">
          {images.map((imageUrl, index) => (
            <button
              key={imageUrl}
              onClick={() => onThumbnailClick(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                currentIndex === index ? "bg-primary" : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
