"use client";

import { useState, useEffect } from "react";
import { ImageDisplayItem } from "@/components/ui/image-display-item";

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
  const [imageError, setImageError] = useState<boolean>(false);
  const [urlExpiry, setUrlExpiry] = useState<number>(0);

  useEffect(() => {
    if (!propertyId) return;

    const fetchCoverImage = async () => {
      try {
        setImageError(false);

        const response = await fetch(
          `/api/properties/${propertyId}/images?action=cover`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch cover image");
        }

        const data = await response.json();

        if (data.coverImageUrl) {
          setImageSrc(data.coverImageUrl);
          setUrlExpiry(Date.now() + 3600 * 1000);
        } else {
          setImageError(true);
        }
      } catch {
        setImageError(true);
      }
    };

    const shouldRefresh = Date.now() > urlExpiry - 300000;

    if (!imageSrc || shouldRefresh) {
      fetchCoverImage();
    }
  }, [propertyId, imageSrc, urlExpiry]);

  const handleImageError = () => {
    setImageError(true);
  };

  if (imageError || (!imageSrc && !imageError)) {
    return (
      <ImageDisplayItem
        src=""
        alt={propertyName}
        className={className}
        width={width}
        height={height}
        aspectRatio={aspectRatio}
        onError={handleImageError}
      />
    );
  }

  return (
    <ImageDisplayItem
      src={imageSrc}
      alt={propertyName}
      className={className}
      width={width}
      height={height}
      aspectRatio={aspectRatio}
      onError={handleImageError}
    />
  );
}
