"use client";

import { useState, useEffect } from "react";
import { ImageDisplayItem } from "@/components/ui/image-display-item";
import { getPropertyCoverImage } from "@/lib/services/imageService";

interface PropertyImageProps {
  propertyId: string;
  propertyName: string;
  className?: string;
  width?: number;
  height?: number;
  aspectRatio?: "video" | "square" | "auto";
}

export function PropertyImage({
  propertyId,
  propertyName,
  className = "",
  width = 400,
  height = 200,
  aspectRatio = "video",
}: PropertyImageProps) {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [imageError, setImageError] = useState<boolean>(false);

  useEffect(() => {
    if (!propertyId) return;

    const abortController = new AbortController();

    const fetchCoverImage = async () => {
      try {
        setIsLoading(true);
        setImageError(false);

        const coverImageUrl = await getPropertyCoverImage(
          propertyId,
          abortController.signal
        );

        if (coverImageUrl) {
          setImageSrc(coverImageUrl);
          setImageError(false);
        } else {
          setImageError(true);
        }
      } catch {
        if (!abortController.signal.aborted) {
          setImageError(true);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchCoverImage();

    return () => {
      abortController.abort();
    };
  }, [propertyId]);

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  return (
    <ImageDisplayItem
      src={imageError ? "" : imageSrc}
      alt={propertyName}
      className={className}
      width={width}
      height={height}
      priority={true}
      aspectRatio={aspectRatio}
      isLoading={isLoading}
      onError={handleImageError}
    />
  );
}
