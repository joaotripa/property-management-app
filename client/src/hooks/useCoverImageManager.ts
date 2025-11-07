import { useState, useEffect } from "react";
import type { PropertyImage } from "@prisma/client";
import { ExistingImageItem } from "@/components/ui/multi-image-upload";

export function useCoverImageManager(existingImages: PropertyImage[]) {
  const [existingImageItems, setExistingImageItems] = useState<
    ExistingImageItem[]
  >([]);
  const [removedExistingImageIds, setRemovedExistingImageIds] = useState<
    Set<string>
  >(new Set());
  const [coverImageIndex, setCoverImageIndex] = useState(0);
  const [initialCoverImageIndex, setInitialCoverImageIndex] = useState(0);

  useEffect(() => {
    const imageItems: ExistingImageItem[] = existingImages
      .filter((imgData: PropertyImage) => imgData.url !== null)
      .map((imgData: PropertyImage) => ({
        url: imgData.url!,
        id: imgData.id,
        filename: imgData.filename,
        isCover: imgData.isCover,
        isExisting: true as const,
      }));
    setExistingImageItems(imageItems);

    const coverIndex = existingImages.findIndex((img) => img.isCover);
    if (coverIndex !== -1) {
      setCoverImageIndex(coverIndex);
      setInitialCoverImageIndex(coverIndex);
    } else {
      setCoverImageIndex(0);
      setInitialCoverImageIndex(0);
    }
  }, [existingImages]);

  const handleRemoveExistingImage = (imageId: string) => {
    setRemovedExistingImageIds((prev) => new Set(prev).add(imageId));

    const visibleImages = existingImageItems.filter(
      (img) => !removedExistingImageIds.has(img.id)
    );
    const removedImageIndex = visibleImages.findIndex(
      (img) => img.id === imageId
    );

    if (removedImageIndex === coverImageIndex && coverImageIndex > 0) {
      setCoverImageIndex(0);
    } else if (removedImageIndex < coverImageIndex) {
      setCoverImageIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const handleCoverImageChange = (index: number) => {
    setCoverImageIndex(index);
  };

  const hasCoverImageChanged = coverImageIndex !== initialCoverImageIndex;

  const visibleImages = existingImageItems.filter(
    (img) => !removedExistingImageIds.has(img.id)
  );

  const resetState = () => {
    setRemovedExistingImageIds(new Set());
    setCoverImageIndex(0);
  };

  const updateFromServer = (newImages: PropertyImage[]) => {
    const imageItems: ExistingImageItem[] = newImages
      .filter((imgData: PropertyImage) => imgData.url !== null)
      .map((imgData: PropertyImage) => ({
        url: imgData.url!,
        id: imgData.id,
        filename: imgData.filename,
        isCover: imgData.isCover,
        isExisting: true as const,
      }));
    setExistingImageItems(imageItems);

    const newCoverImageIndex = newImages.findIndex((img) => img.isCover);
    if (newCoverImageIndex !== -1) {
      setCoverImageIndex(newCoverImageIndex);
      setInitialCoverImageIndex(newCoverImageIndex);
    } else {
      setCoverImageIndex(0);
      setInitialCoverImageIndex(0);
    }
  };

  return {
    existingImageItems,
    removedExistingImageIds,
    coverImageIndex,
    hasCoverImageChanged,
    visibleImages,
    handleRemoveExistingImage,
    handleCoverImageChange,
    resetState,
    updateFromServer,
  };
}
