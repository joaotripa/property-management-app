import Image from "next/image";

interface BlogImageProps {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export default function BlogImage({
  src,
  alt,
  caption,
  width = 1200,
  height = 700,
}: BlogImageProps) {
  return (
    <figure className="my-8">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full max-w-4xl mx-auto rounded-lg shadow-lg"
        priority={false}
      />
      {caption && (
        <figcaption className="text-sm text-muted-foreground text-center italic mt-2">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
