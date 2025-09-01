"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Home } from "lucide-react";

interface PropertyImageProps {
  propertyId: string;
  propertyName: string;
  className?: string;
  width?: number;
  height?: number;
}

export function PropertyImage({
  propertyId,
  propertyName,
  className = "",
  width = 400,
  height = 200,
}: PropertyImageProps) {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [imageError, setImageError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [urlExpiry, setUrlExpiry] = useState<number>(0);

  useEffect(() => {
    if (!propertyId) return;

    const fetchCoverImage = async () => {
      try {
        setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    };

    const shouldRefresh = Date.now() > urlExpiry - 300000;
    
    if (!imageSrc || shouldRefresh) {
      fetchCoverImage();
    }
  }, [propertyId, imageSrc, urlExpiry]);

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const SkeletonImage = () => (
    <div
      className={`${className} bg-muted-foreground/10 flex items-center justify-center`}
    >
      <div className="w-16 h-16 bg-primary/60 rounded-full flex items-center justify-center">
        <Home className="w-8 h-8 text-background" />
      </div>
    </div>
  );

  // Show skeleton while loading or if there's an error
  if (isLoading || imageError || !imageSrc) {
    return <SkeletonImage />;
  }

  return (
    <Image
      src={imageSrc}
      alt={propertyName}
      width={width}
      height={height}
      className={className}
      onError={handleImageError}
      onLoad={handleImageLoad}
      priority={false}
    />
  );
}
