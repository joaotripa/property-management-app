import type { PropertyImage } from "@prisma/client";
import { ImageCarousel } from "@/components/ui/image-carousel";

interface PropertyImageCarouselProps {
  images: PropertyImage[];
  propertyName: string;
  isLoading: boolean;
}

export function PropertyImageCarousel({
  images,
  propertyName,
  isLoading,
}: PropertyImageCarouselProps) {
  return (
    <div className="flex flex-col gap-4">
      <ImageCarousel
        images={images}
        propertyName={propertyName}
        className="w-full"
        aspectRatio="video"
        showThumbnails={images.length > 1}
        isLoading={isLoading}
      />
    </div>
  );
}