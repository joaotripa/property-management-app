"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, Crown } from "lucide-react";
import { cn } from "@/lib/utils/index";
import { ImageDisplayItem } from "@/components/ui/image-display-item";

export interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

export interface ExistingImageItem {
  url: string;
  id: string;
  isExisting: true;
}

export type ImageGridItem = FileWithPreview | ExistingImageItem;

export interface ImageGridProps {
  items: ImageGridItem[];
  coverImageIndex: number;
  onCoverImageChange: (index: number) => void;
  onRemoveItem: (index: number) => void;
  onAddMore?: () => void;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
  showAddMore?: boolean;
  isDragOver?: boolean;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export function ImageGrid({
  items,
  coverImageIndex,
  onCoverImageChange,
  onRemoveItem,
  onAddMore,
  maxFiles = 10,
  disabled = false,
  className,
  showAddMore = true,
  isDragOver = false,
  onDragOver,
  onDragLeave,
  onDrop,
}: ImageGridProps) {

  const handleSetCoverImage = (index: number) => {
    if (disabled) return;
    onCoverImageChange(index);
  };

  const handleRemove = (index: number) => {
    if (disabled) return;
    onRemoveItem(index);
  };

  const handleAddMoreClick = () => {
    if (!disabled && onAddMore) {
      onAddMore();
    }
  };

  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4",
        className
      )}
    >
      {items.map((item, index) => {
        const isExisting = "isExisting" in item;
        const imageSrc = isExisting ? item.url : item.preview;
        const itemName = isExisting
          ? `Existing image ${index + 1}`
          : item.file.name;

        return (
          <div key={item.id} className="relative group">
            <Card className="overflow-hidden aspect-square p-0">
              <CardContent className="p-0 h-full">
                <ImageDisplayItem
                  src={imageSrc}
                  alt={`Preview ${index + 1}`}
                  fill
                  aspectRatio="square"
                  className="h-full"
                  onLoad={() => {
                    console.log("Image loaded successfully:", itemName);
                  }}
                  onError={() => {
                    console.error("Image load error for:", itemName);
                  }}
                />

                {/* Cover Image Badge */}
                {index === coverImageIndex && (
                  <div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3 text-primary-foreground" />
                    <span className="text-xs font-medium text-primary-foreground">
                      Cover
                    </span>
                  </div>
                )}


                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  disabled={disabled}
                  className="absolute top-2 right-2 bg-destructive/90 hover:bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 hover:cursor-pointer"
                  aria-label={`Remove ${itemName}`}
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Set as Cover Button */}
                {index !== coverImageIndex && (
                  <button
                    type="button"
                    onClick={() => handleSetCoverImage(index)}
                    disabled={disabled}
                    className="absolute top-2 left-2 bg-secondary/90 hover:bg-secondary text-secondary-foreground rounded-full px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 hover:cursor-pointer"
                    aria-label={`Set ${itemName} as cover image`}
                  >
                    Set as Cover
                  </button>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}

      {/* Add More Button */}
      {showAddMore && items.length < maxFiles && onAddMore && (
        <Card
          className={cn(
            "aspect-auto border-2 border-dashed cursor-pointer hover:border-primary/50 transition-colors h-full",
            disabled && "opacity-50 cursor-not-allowed",
            isDragOver && "border-primary bg-primary/5"
          )}
          onClick={handleAddMoreClick}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <CardContent className="h-full flex flex-col items-center justify-center text-center">
            <div className="aspect-square w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Add More
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {items.length} of {maxFiles}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
