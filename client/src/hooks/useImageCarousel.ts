"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [errorImages, setErrorImages] = useState<Set<number>>(new Set());

  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages(prev => new Set(prev).add(index));
    setErrorImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  }, []);

  const handleImageError = useCallback((index: number) => {
    setErrorImages(prev => new Set(prev).add(index));
    setLoadedImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  }, []);

  const isImageLoaded = useCallback((index: number) => {
    return loadedImages.has(index);
  }, [loadedImages]);

  const hasImageError = useCallback((index: number) => {
    return errorImages.has(index);
  }, [errorImages]);

  // Reset states when images array changes
  useEffect(() => {
    setLoadedImages(new Set());
    setErrorImages(new Set());
  }, [images]);

  return {
    handleImageLoad,
    handleImageError,
    isImageLoaded,
    hasImageError,
  };
}