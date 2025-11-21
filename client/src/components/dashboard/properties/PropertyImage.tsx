import { ImageDisplayItem } from "@/components/ui/image-display-item";

interface PropertyImageProps {
  coverImageUrl?: string | null;
  propertyName: string;
  className?: string;
  width?: number;
  height?: number;
  aspectRatio?: "video" | "square" | "auto";
}

export function PropertyImage({
  coverImageUrl,
  propertyName,
  className = "",
  width = 400,
  height = 200,
  aspectRatio = "video",
}: PropertyImageProps) {
  return (
    <ImageDisplayItem
      src={coverImageUrl || ""}
      alt={propertyName}
      className={className}
      width={width}
      height={height}
      priority={true}
      aspectRatio={aspectRatio}
      isLoading={false}
    />
  );
}
