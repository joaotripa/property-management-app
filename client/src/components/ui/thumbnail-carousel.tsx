"use client";

import { memo, useCallback } from "react";
import Image from "next/image";
import { Home } from "lucide-react";
import type { PropertyImage } from "@prisma/client";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "./carousel";

export interface ThumbnailCarouselProps {
  images: PropertyImage[];
  currentIndex: number;
  onThumbnailClick: (index: number) => void;
  setThumbnailApi?: (api: CarouselApi) => void;
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
  setThumbnailApi,
  className,
  thumbnailSize = 64,
  maxVisibleThumbnails = 6,
  handleImageLoad,
  handleImageError,
  hasImageError,
}: ThumbnailCarouselProps) => {
  const handleThumbnailClick = useCallback(
    (index: number) => {
      onThumbnailClick(index);
    },
    [onThumbnailClick]
  );

  const ThumbnailContent = memo(
    ({ image, index }: { image: PropertyImage; index: number }) => (
      <>
        {image.url && !hasImageError(index) ? (
          <Image
            src={image.url}
            alt={`Thumbnail ${index + 1}`}
            fill
            className="absolute inset-0 object-cover pointer-events-none"
            sizes="64px"
            onLoad={() => handleImageLoad(index)}
            onError={() => handleImageError(index)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-muted/20">
            <Home className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </>
    )
  );

  ThumbnailContent.displayName = "ThumbnailContent";

  // Always use carousel layout
  return (
    <div className={cn("relative", className)}>
      <Carousel
        setApi={setThumbnailApi}
        opts={{
          align: "start",
          containScroll: "trimSnaps",
          watchDrag: false,
          dragFree: false,
        }}
        className="w-full"
      >
        <CarouselContent className="ml-0 gap-1">
          {images.map((image, index) => (
            <CarouselItem
              key={image.id}
              className={cn(
                "basis-auto relative rounded-lg overflow-hidden border-2 transition-all duration-200 hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer",
                currentIndex === index
                  ? "border-primary"
                  : "border-transparent hover:border-primary/40"
              )}
              style={{
                flexBasis: `${thumbnailSize + 8}px`,
                width: thumbnailSize,
                height: thumbnailSize,
              }}
              onClick={() => handleThumbnailClick(index)}
              role="button"
              tabIndex={0}
              aria-label={`View image ${index + 1}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleThumbnailClick(index);
                }
              }}
            >
              <ThumbnailContent image={image} index={index} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

ThumbnailCarouselComponent.displayName = "ThumbnailCarousel";

export const ThumbnailCarousel = memo(ThumbnailCarouselComponent);
