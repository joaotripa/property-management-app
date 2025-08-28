"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getPropertyImageUrl } from "@/lib/file-uploads";

interface PropertyImageProps {
  propertyId: string;
  propertyName: string;
  className?: string;
  width?: number;
  height?: number;
  fallbackSrc?: string;
}

export function PropertyImage({
  propertyId,
  propertyName,
  className = "",
  width = 400,
  height = 200,
  fallbackSrc = "/properties/house1-template.jpg",
}: PropertyImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(fallbackSrc);
  const [imageError, setImageError] = useState<boolean>(false);

  useEffect(() => {
    // Get the Supabase storage URL for this property
    const supabaseImageUrl = getPropertyImageUrl(propertyId);
    setImageSrc(supabaseImageUrl);
  }, [propertyId]);

  const handleImageError = () => {
    if (!imageError) {
      // First error: try fallback
      setImageError(true);
      setImageSrc(fallbackSrc);
    }
  };

  return (
    <Image
      src={imageSrc}
      alt={propertyName}
      width={width}
      height={height}
      className={className}
      onError={handleImageError}
      priority={false}
    />
  );
}
