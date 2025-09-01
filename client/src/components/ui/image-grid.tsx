"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";

export interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

export interface ImageGridProps {
  files: FileWithPreview[];
  coverImageIndex: number;
  onCoverImageChange: (index: number) => void;
  onRemoveFile: (index: number) => void;
  onAddMore?: () => void;
  maxFiles?: number;
  isUploading?: boolean;
  uploadProgress?: number[];
  disabled?: boolean;
  className?: string;
  showAddMore?: boolean;
  isDragOver?: boolean;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export function ImageGrid({
  files,
  coverImageIndex,
  onCoverImageChange,
  onRemoveFile,
  onAddMore,
  maxFiles = 10,
  isUploading = false,
  uploadProgress = [],
  disabled = false,
  className,
  showAddMore = true,
  isDragOver = false,
  onDragOver,
  onDragLeave,
  onDrop,
}: ImageGridProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSetCoverImage = (index: number) => {
    if (disabled || isUploading) return;
    onCoverImageChange(index);
  };

  const handleRemove = (index: number) => {
    if (disabled || isUploading) return;
    onRemoveFile(index);
  };

  const handleAddMoreClick = () => {
    if (!disabled && !isUploading && onAddMore) {
      onAddMore();
    }
  };

  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4",
        className
      )}
    >
      {files.map((fileWithPreview, index) => (
        <div key={fileWithPreview.id} className="relative group">
          <Card className="overflow-hidden aspect-video">
            <CardContent className="p-0 h-full">
              <Image
                src={fileWithPreview.preview}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover rounded-md"
                onError={(e) => {
                  console.error(
                    "Image load error for:",
                    fileWithPreview.file.name,
                    e
                  );
                }}
                onLoad={() => {
                  console.log(
                    "Image loaded successfully:",
                    fileWithPreview.file.name
                  );
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

              {/* Upload Progress */}
              {isUploading &&
                uploadProgress[index] !== undefined &&
                uploadProgress[index] < 100 && (
                  <div className="absolute inset-0 bg-muted/50 flex flex-col items-center justify-center rounded-md p-4">
                    <div className="w-full max-w-[80%] gap-2">
                      <Progress value={uploadProgress[index]} className="h-2" />
                    </div>
                  </div>
                )}

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={disabled || isUploading}
                className="absolute top-2 right-2 bg-destructive/90 hover:bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                aria-label={`Remove ${fileWithPreview.file.name}`}
              >
                <X className="w-3 h-3" />
              </button>

              {/* Set as Cover Button */}
              {index !== coverImageIndex && (
                <button
                  type="button"
                  onClick={() => handleSetCoverImage(index)}
                  disabled={disabled || isUploading}
                  className="absolute top-2 left-2 bg-secondary/90 hover:bg-secondary text-secondary-foreground rounded-full px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  aria-label={`Set ${fileWithPreview.file.name} as cover image`}
                >
                  Set as Cover
                </button>
              )}
            </CardContent>
          </Card>

          {/* File Info */}
          <div className="mt-1 text-center">
            <p
              className="text-xs text-muted-foreground truncate"
              title={fileWithPreview.file.name}
            >
              {fileWithPreview.file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(fileWithPreview.file.size)}
            </p>
          </div>
        </div>
      ))}

      {/* Add More Button */}
      {showAddMore && files.length < maxFiles && onAddMore && (
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
              {files.length} of {maxFiles}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
