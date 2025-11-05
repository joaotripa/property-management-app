"use client";

import { ImageDisplayItem } from "@/components/ui/image-display-item";
import { usePropertyCoverImage } from "@/hooks/queries/usePropertyQueries";

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
  const {
    data: coverImageUrl = null,
    isLoading,
    error,
  } = usePropertyCoverImage(propertyId);

  const handleImageError = () => {
    // ImageDisplayItem will handle the error state
  };

  return (
    <ImageDisplayItem
      src={coverImageUrl || ""}
      alt={propertyName}
      className={className}
      width={width}
      height={height}
      priority={true}
      aspectRatio={aspectRatio}
      isLoading={isLoading}
      onError={error ? undefined : handleImageError}
    />
  );
}
