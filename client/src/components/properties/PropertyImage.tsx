"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Home } from "lucide-react";
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
  const [imageSrc, setImageSrc] = useState<string>("");
  const [imageError, setImageError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Get the Supabase storage URL for this property
    const supabaseImageUrl = getPropertyImageUrl(propertyId);
    setImageSrc(supabaseImageUrl);
  }, [propertyId]);

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

  if (imageError || !imageSrc) {
    return <SkeletonImage />;
  }

  return (
    <>
      {isLoading && <SkeletonImage />}
      <Image
        src={imageSrc}
        alt={propertyName}
        width={width}
        height={height}
        className={`${className} ${isLoading ? "hidden" : ""}`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        priority={false}
      />
    </>
  );
}
