"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { CarouselApi } from "@/components/ui/carousel";
import type { PropertyImage } from "@prisma/client";

export function useImageCarouselSync(images: PropertyImage[]) {
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

  const onThumbnailClick = useCallback((imageId: string) => {
    // Find the index of the image with the given ID
    const index = images.findIndex(img => img.id === imageId);
    if (index === -1) return;

    if (mainApi) {
      mainApi.scrollTo(index);
    }
    if (thumbnailApi) {
      thumbnailApi.scrollTo(index);
    }
    setCurrentIndex(index);
  }, [mainApi, thumbnailApi, images]);

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

export function useImageLoading(images: PropertyImage[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [errorImages, setErrorImages] = useState<Set<string>>(new Set());

  // Use useMemo to detect when images actually change to prevent effect loops
  const imageUrlsString = useMemo(() => JSON.stringify(images.map(img => img.url)), [images]);
  const [lastImageUrlsString, setLastImageUrlsString] = useState<string>("");

  const handleImageLoad = useCallback((imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    setLoadedImages(prev => new Set(prev).add(image.url));
    setErrorImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(image.url);
      return newSet;
    });
  }, [images]);

  const handleImageError = useCallback((imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    // Permanently mark this URL as failed - no retries
    setErrorImages(prev => new Set(prev).add(image.url));
    setLoadedImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(image.url);
      return newSet;
    });
  }, [images]);

  const isImageLoaded = useCallback((imageId: string) => {
    const image = images.find(img => img.id === imageId);
    return image ? loadedImages.has(image.url) : false;
  }, [loadedImages, images]);

  const hasImageError = useCallback((imageId: string) => {
    const image = images.find(img => img.id === imageId);
    return image ? errorImages.has(image.url) : false;
  }, [errorImages, images]);

  // Only reset states when the actual image URLs change, not on re-renders
  useEffect(() => {
    if (imageUrlsString !== lastImageUrlsString) {
      setLastImageUrlsString(imageUrlsString);
      const currentUrls = images.map(img => img.url);
      // Only clear states for URLs that are no longer in the new images array
      setLoadedImages(prev => {
        const newSet = new Set<string>();
        for (const url of prev) {
          if (currentUrls.includes(url)) {
            newSet.add(url);
          }
        }
        return newSet;
      });
      setErrorImages(prev => {
        const newSet = new Set<string>();
        for (const url of prev) {
          if (currentUrls.includes(url)) {
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