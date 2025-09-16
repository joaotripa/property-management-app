"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { CarouselApi } from "@/components/ui/carousel";

export function useImageCarouselSync() {
  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [thumbnailApi, setThumbnailApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);

  const onMainSelect = useCallback((api: CarouselApi) => {
    if (!api) return;
    setCurrentIndex(api.selectedScrollSnap());
    
    if (thumbnailApi) {
      thumbnailApi.scrollTo(api.selectedScrollSnap());
    }
  }, [thumbnailApi]);

  const onThumbnailSelect = useCallback((api: CarouselApi) => {
    if (!api) return;
    const selectedIndex = api.selectedScrollSnap();
    setCurrentIndex(selectedIndex);
    
    if (mainApi) {
      mainApi.scrollTo(selectedIndex);
    }
  }, [mainApi]);

  const onThumbnailClick = useCallback((index: number) => {
    if (mainApi) {
      mainApi.scrollTo(index);
    }
    if (thumbnailApi) {
      thumbnailApi.scrollTo(index);
    }
    setCurrentIndex(index);
  }, [mainApi, thumbnailApi]);

  useEffect(() => {
    if (!mainApi) return;
    
    onMainSelect(mainApi);
    mainApi.on("select", onMainSelect);

    return () => {
      mainApi.off("select", onMainSelect);
    };
  }, [mainApi, onMainSelect]);

  useEffect(() => {
    if (!thumbnailApi) return;
    
    onThumbnailSelect(thumbnailApi);
    thumbnailApi.on("select", onThumbnailSelect);

    return () => {
      thumbnailApi.off("select", onThumbnailSelect);
    };
  }, [thumbnailApi, onThumbnailSelect]);

  return {
    mainApi,
    setMainApi,
    thumbnailApi,
    setThumbnailApi,
    currentIndex,
    onThumbnailClick,
  };
}

export function useImageLoading(images: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [errorImages, setErrorImages] = useState<Set<string>>(new Set());

  // Use useMemo to detect when images actually change to prevent effect loops
  const imageUrlsString = useMemo(() => JSON.stringify(images), [images]);
  const [lastImageUrlsString, setLastImageUrlsString] = useState<string>("");

  const handleImageLoad = useCallback((index: number) => {
    const imageUrl = images[index];
    if (!imageUrl) return;

    setLoadedImages(prev => new Set(prev).add(imageUrl));
    setErrorImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageUrl);
      return newSet;
    });
  }, [images]);

  const handleImageError = useCallback((index: number) => {
    const imageUrl = images[index];
    if (!imageUrl) return;

    // Permanently mark this URL as failed - no retries
    setErrorImages(prev => new Set(prev).add(imageUrl));
    setLoadedImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageUrl);
      return newSet;
    });
  }, [images]);

  const isImageLoaded = useCallback((index: number) => {
    const imageUrl = images[index];
    return imageUrl ? loadedImages.has(imageUrl) : false;
  }, [loadedImages, images]);

  const hasImageError = useCallback((index: number) => {
    const imageUrl = images[index];
    return imageUrl ? errorImages.has(imageUrl) : false;
  }, [errorImages, images]);

  // Only reset states when the actual image URLs change, not on re-renders
  useEffect(() => {
    if (imageUrlsString !== lastImageUrlsString) {
      setLastImageUrlsString(imageUrlsString);
      // Only clear states for URLs that are no longer in the new images array
      setLoadedImages(prev => {
        const newSet = new Set<string>();
        for (const url of prev) {
          if (images.includes(url)) {
            newSet.add(url);
          }
        }
        return newSet;
      });
      setErrorImages(prev => {
        const newSet = new Set<string>();
        for (const url of prev) {
          if (images.includes(url)) {
            newSet.add(url);
          }
        }
        return newSet;
      });
    }
  }, [imageUrlsString, lastImageUrlsString, images]);

  return {
    handleImageLoad,
    handleImageError,
    isImageLoaded,
    hasImageError,
  };
}