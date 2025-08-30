"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export interface ImageCarouselProps {
  images: string[];
  propertyName?: string;
  className?: string;
  showThumbnails?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  aspectRatio?: "video" | "square" | "auto";
  onImageChange?: (index: number) => void;
}

export function ImageCarousel({
  images,
  propertyName = "Property",
  className,
  showThumbnails = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  aspectRatio = "video",
  onImageChange,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, images.length, autoPlayInterval]);

  // Notify parent of image changes
  useEffect(() => {
    onImageChange?.(currentIndex);
  }, [currentIndex, onImageChange]);

  // Reset index if images change
  useEffect(() => {
    if (currentIndex >= images.length) {
      setCurrentIndex(0);
    }
  }, [images.length, currentIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
  };

  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  const isVideo = (url: string) => {
    return url.match(/\.(mp4|mov|avi|wmv)(\?.*)?$/i);
  };

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

  // Show skeleton if no images
  if (images.length === 0) {
    return (
      <div className={cn("relative bg-muted/30 rounded-lg flex items-center justify-center", getAspectRatioClass(), className)}>
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-primary/60" />
          </div>
          <p className="text-sm text-muted-foreground">No images available</p>
        </div>
      </div>
    );
  }

  // Single image display (no controls needed)
  if (images.length === 1) {
    const imageUrl = images[0];
    const hasError = imageErrors.has(0);

    if (hasError) {
      return (
        <div className={cn("relative bg-muted/30 rounded-lg flex items-center justify-center", getAspectRatioClass(), className)}>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-primary/60" />
            </div>
            <p className="text-sm text-muted-foreground">Image not available</p>
          </div>
        </div>
      );
    }

    if (isVideo(imageUrl)) {
      return (
        <div className={cn("relative bg-black rounded-lg overflow-hidden", getAspectRatioClass(), className)}>
          <video
            src={imageUrl}
            controls
            className="w-full h-full object-cover"
            preload="metadata"
          />
        </div>
      );
    }

    return (
      <div className={cn("relative rounded-lg overflow-hidden", getAspectRatioClass(), className)}>
        <Image
          src={imageUrl}
          alt={propertyName}
          fill
          className="object-cover"
          onError={() => handleImageError(0)}
          priority
        />
      </div>
    );
  }

  // Multiple images carousel
  const currentImageUrl = images[currentIndex];
  const currentImageHasError = imageErrors.has(currentIndex);

  return (
    <div className={cn("relative space-y-4", className)}>
      {/* Main Image Display */}
      <div className={cn("relative bg-black rounded-lg overflow-hidden group", getAspectRatioClass())}>
        {currentImageHasError ? (
          <div className="w-full h-full bg-muted/30 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-primary/60" />
              </div>
              <p className="text-sm text-muted-foreground">Image not available</p>
            </div>
          </div>
        ) : isVideo(currentImageUrl) ? (
          <video
            key={currentIndex}
            src={currentImageUrl}
            controls
            className="w-full h-full object-cover"
            preload="metadata"
          />
        ) : (
          <Image
            key={currentIndex}
            src={currentImageUrl}
            alt={`${propertyName} - Image ${currentIndex + 1}`}
            fill
            className="object-cover transition-opacity duration-300"
            onError={() => handleImageError(currentIndex)}
            priority={currentIndex === 0}
          />
        )}

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handlePrevious}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleNext}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>

        {/* Auto-play Control */}
        {images.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={toggleAutoPlay}
          >
            <Play className={cn("w-4 h-4", isPlaying && "fill-current")} />
          </Button>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {showThumbnails && images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((imageUrl, index) => {
            const hasError = imageErrors.has(index);
            
            return (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={cn(
                  "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                  currentIndex === index 
                    ? "border-primary ring-2 ring-primary/20" 
                    : "border-transparent hover:border-muted-foreground/50"
                )}
              >
                {hasError ? (
                  <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                    <Home className="w-6 h-6 text-primary/60" />
                  </div>
                ) : isVideo(imageUrl) ? (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <Image
                    src={imageUrl}
                    alt={`Thumbnail ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(index)}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Dot Indicators (alternative to thumbnails) */}
      {!showThumbnails && images.length > 1 && (
        <div className="flex justify-center gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
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