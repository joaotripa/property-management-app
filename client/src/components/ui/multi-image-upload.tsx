"use client";

import React, { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageGrid } from "@/components/ui/image-grid";
import { Button } from "@/components/ui/button";

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

export interface MultiImageUploadProps {
  files: FileWithPreview[];
  onFilesChange: (files: FileWithPreview[]) => void;
  existingImages?: ExistingImageItem[];
  onRemoveExistingImage?: (id: string) => void;
  coverImageIndex: number;
  onCoverImageChange: (index: number) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  error?: string | null;
  disabled?: boolean;
  className?: string;
  label?: string;
  description?: string;
  isUploading?: boolean;
  uploadProgress?: { [key: number]: number };
}

export function MultiImageUpload({
  files,
  onFilesChange,
  existingImages = [],
  onRemoveExistingImage,
  coverImageIndex,
  onCoverImageChange,
  accept = "image/*",
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  error,
  isUploading = false,
  uploadProgress = {},
  disabled = false,
  className,
  label,
  description,
}: MultiImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFileId = () => Math.random().toString(36).substring(2, 11);

  const createFilePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          resolve(result);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || disabled || isUploading) return;

    setValidationErrors([]);

    const currentFileCount = files.length;
    const fileArray = Array.from(selectedFiles);
    const newErrors: string[] = [];

    const filesToProcess = fileArray.slice(0, maxFiles - currentFileCount);

    if (fileArray.length > maxFiles - currentFileCount) {
      newErrors.push(
        `Only ${maxFiles - currentFileCount} more files can be added. ${fileArray.length - (maxFiles - currentFileCount)} files were ignored.`
      );
    }

    const filePromises = filesToProcess.map(async (file) => {
      if (file.size > maxSize) {
        const maxSizeText = formatFileSize(maxSize);
        newErrors.push(
          `"${file.name}" is too large (${formatFileSize(file.size)}). Maximum size is ${maxSizeText}.`
        );
        return null;
      }

      if (!file.type.startsWith("image/")) {
        newErrors.push(
          `"${file.name}" is not an image file. Please select JPG, PNG, WebP, or GIF files only.`
        );
        return null;
      }

      try {
        const preview = await createFilePreview(file);
        console.log(
          "Created preview for:",
          file.name,
          "Preview URL:",
          preview.substring(0, 50) + "..."
        );
        return {
          file,
          preview,
          id: generateFileId(),
        };
      } catch (error) {
        console.error("Error creating preview for file:", file.name, error);
        newErrors.push(
          `Failed to process "${file.name}". The file may be corrupted or unsupported.`
        );
        return null;
      }
    });

    const results = await Promise.all(filePromises);

    const validFiles = results.filter(
      (result): result is FileWithPreview => result !== null
    );
    console.log("Valid files processed:", validFiles.length, "files");

    if (newErrors.length > 0) {
      setValidationErrors(newErrors);
    }

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveFile = (index: number) => {
    if (disabled) return;

    // Clear validation errors when user removes files
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }

    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);

    if (coverImageIndex === index) {
      onCoverImageChange(0);
    } else if (coverImageIndex > index) {
      onCoverImageChange(coverImageIndex - 1);
    }
  };

  const handleAddMore = () => {
    if (!disabled) {
      if (validationErrors.length > 0) {
        setValidationErrors([]);
      }
      fileInputRef.current?.click();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const allItems: (FileWithPreview | ExistingImageItem)[] = [
    ...existingImages,
    ...files,
  ];

  const hasAnyImages = allItems.length > 0;

  const hasUploadProgress = Object.keys(uploadProgress).length > 0;

  return (
    <div className={cn("space-y-4", className)}>
      {(label || description) && (
        <div>
          {label && <Label className="text-base font-medium">{label}</Label>}
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}

      {/* Image Grid */}
      {hasAnyImages && (
        <ImageGrid
          items={allItems}
          coverImageIndex={coverImageIndex}
          onCoverImageChange={onCoverImageChange}
          onRemoveItem={(index) => {
            if (index < existingImages.length) {
              // Removing existing image
              const existingImage = existingImages[index];
              onRemoveExistingImage?.(existingImage.id);
            } else {
              // Removing new file - adjust index for new files array
              handleRemoveFile(index - existingImages.length);
            }
          }}
          onAddMore={handleAddMore}
          maxFiles={maxFiles}
          disabled={disabled}
          showAddMore={true}
          isDragOver={isDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />
      )}

      {/* Initial Upload Area */}
      {!hasAnyImages && (
        <Card
          className={cn(
            "border-2 border-dashed transition-colors cursor-pointer",
            isDragOver && "border-primary bg-primary/5",
            (disabled || isUploading || hasUploadProgress) &&
              "opacity-50 cursor-not-allowed",
            error && "border-destructive"
          )}
          onClick={handleAddMore}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-lg font-medium">Add Property Images</p>
              <p className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                Images up to {formatFileSize(maxSize)} each (max {maxFiles}{" "}
                files)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || files.length >= maxFiles}
        multiple
      />

      {/* Validation Error Display */}
      {validationErrors.length > 0 && (
        <div className="flex items-start gap-2 px-3 py-4 bg-destructive/5 border border-destructive/20 rounded-md text-sm">
          <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium text-destructive mb-1">
              {validationErrors.length === 1
                ? "File Upload Error"
                : `${validationErrors.length} File Upload Errors`}
            </div>
            <ul className="gap-2">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-destructive text-sm">
                  {error}
                </li>
              ))}
            </ul>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 mt-0.5"
            onClick={() => setValidationErrors([])}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* General Error Display */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-4 bg-destructive/5 border border-destructive/20 rounded-md text-sm">
          <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
          <span className="text-destructive font-medium">Upload Error:</span>
          <span className="text-destructive/90">{error}</span>
        </div>
      )}
    </div>
  );
}
