"use client";

import { useEffect, useCallback, memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PropertyImage } from "@prisma/client";
import { cn } from "@/lib/utils/index";
import { ImageDisplayItem } from "./image-display-item";
import { ThumbnailCarousel } from "./thumbnail-carousel";
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
  images: PropertyImage[];
  propertyName?: string;
  className?: string;
  showThumbnails?: boolean;
  aspectRatio?: "video" | "square" | "auto";
  onImageChange?: (index: number) => void;
  isLoading?: boolean;
}

const ImageCarouselComponent = ({
  images,
  propertyName = "Property",
  className,
  showThumbnails = true,
  aspectRatio = "video",
  onImageChange,
  isLoading = false,
}: ImageCarouselProps) => {
  const validImages = images.filter((img) => img.url !== null);

  const { setMainApi, setThumbnailApi, currentIndex, onThumbnailClick } =
    useImageCarouselSync();

  const { handleImageLoad, handleImageError, hasImageError, isImageLoaded } =
    useImageLoading(validImages.length);

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

  // Notify parent component when current image changes
  useEffect(() => {
    onImageChange?.(currentIndex);
  }, [currentIndex, onImageChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!validImages.length) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          const prevIndex =
            currentIndex > 0 ? currentIndex - 1 : validImages.length - 1;
          onThumbnailClick(prevIndex);
          break;
        case "ArrowRight":
          e.preventDefault();
          const nextIndex =
            currentIndex < validImages.length - 1 ? currentIndex + 1 : 0;
          onThumbnailClick(nextIndex);
          break;
      }
    },
    [currentIndex, validImages.length, onThumbnailClick]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        <div
          className={cn(
            "relative rounded-lg overflow-hidden w-full bg-muted/20 animate-pulse",
            getAspectRatioClass()
          )}
        />
        {showThumbnails && (
          <div className="flex gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="w-16 h-16 bg-muted/20 rounded-lg animate-pulse"
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // No images state
  if (validImages.length === 0) {
    return (
      <div className={cn("relative", getAspectRatioClass(), className)}>
        <ImageDisplayItem
          src=""
          alt="No images available"
          className="rounded-lg"
          fill
          aspectRatio={aspectRatio}
          isLoading={false}
        />
      </div>
    );
  }

  // Single image state
  if (validImages.length === 1) {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        <div
          className={cn(
            "relative rounded-lg overflow-hidden w-full",
            getAspectRatioClass()
          )}
        >
          <ImageDisplayItem
            src={validImages[0].url!}
            alt={`${propertyName} - Image 1`}
            fill
            priority
            onLoad={() => handleImageLoad(0)}
            onError={() => handleImageError(0)}
            hasError={hasImageError(0)}
            isLoading={!isImageLoaded(0) && !hasImageError(0)}
            aspectRatio={aspectRatio}
          />
        </div>
      </div>
    );
  }

  // Multiple images carousel
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
            {validImages.map((image, index) => (
              <CarouselItem key={image.id}>
                <div
                  className={cn(
                    "relative rounded-lg overflow-hidden w-full",
                    getAspectRatioClass()
                  )}
                >
                  <ImageDisplayItem
                    src={image.url!}
                    alt={`${propertyName} - Image ${index + 1}`}
                    fill
                    priority={index === 0}
                    onLoad={() => handleImageLoad(index)}
                    onError={() => handleImageError(index)}
                    hasError={hasImageError(index)}
                    isLoading={!isImageLoaded(index) && !hasImageError(index)}
                    aspectRatio={aspectRatio}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation Buttons */}
          <CarouselPrevious className="left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-primary/90 text-primary hover:text-background border-border size-10">
            <ChevronLeft className="size-5" />
          </CarouselPrevious>

          <CarouselNext className="right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-primary/90 text-primary hover:text-background border-border size-10">
            <ChevronRight className="w-5 h-5" />
          </CarouselNext>
        </Carousel>

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-background/80 text-primary px-3 py-1 rounded-full text-xs backdrop-blur-sm border border-border">
          {currentIndex + 1} / {validImages.length}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {showThumbnails && validImages.length > 1 && (
        <ThumbnailCarousel
          images={validImages}
          currentIndex={currentIndex}
          onThumbnailClick={onThumbnailClick}
          setThumbnailApi={setThumbnailApi}
          handleImageLoad={handleImageLoad}
          handleImageError={handleImageError}
          hasImageError={hasImageError}
        />
      )}

      {/* Dot Indicators (alternative to thumbnails) */}
      {!showThumbnails && validImages.length > 1 && (
        <div className="flex justify-center gap-2">
          {validImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => onThumbnailClick(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                currentIndex === index ? "bg-primary" : "bg-muted-foreground/30"
              )}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ImageCarousel = memo(ImageCarouselComponent);
