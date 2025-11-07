"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  MultiImageUpload,
  FileWithPreview,
  ExistingImageItem,
} from "@/components/ui/multi-image-upload";

interface PropertyImagesManagerProps {
  newImages: FileWithPreview[];
  onNewImagesChange: (files: FileWithPreview[]) => void;
  existingImages: ExistingImageItem[];
  onRemoveExistingImage: (imageId: string) => void;
  coverImageIndex: number;
  onCoverImageChange: (index: number) => void;
  imageError: string | null;
  isSaving: boolean;
}

export function PropertyImagesManager({
  newImages,
  onNewImagesChange,
  existingImages,
  onRemoveExistingImage,
  coverImageIndex,
  onCoverImageChange,
  imageError,
  isSaving,
}: PropertyImagesManagerProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Property Images</CardTitle>
        <CardDescription>
          Upload new images for this property. Existing images will be
          preserved.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MultiImageUpload
          files={newImages}
          onFilesChange={onNewImagesChange}
          existingImages={existingImages}
          onRemoveExistingImage={onRemoveExistingImage}
          coverImageIndex={coverImageIndex}
          onCoverImageChange={onCoverImageChange}
          error={imageError}
          maxFiles={10}
          maxSize={5 * 1024 * 1024}
          disabled={isSaving}
        />
      </CardContent>
    </Card>
  );
}
