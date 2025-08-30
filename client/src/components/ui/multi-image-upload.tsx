"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, X, Crown, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

export interface MultiImageUploadProps {
  files: FileWithPreview[];
  onFilesChange: (files: FileWithPreview[]) => void;
  coverImageIndex: number;
  onCoverImageChange: (index: number) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  isUploading?: boolean;
  uploadProgress?: number[];
  error?: string | null;
  disabled?: boolean;
  className?: string;
  label?: string;
  description?: string;
}

export function MultiImageUpload({
  files,
  onFilesChange,
  coverImageIndex,
  onCoverImageChange,
  accept = "image/*",
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  isUploading = false,
  uploadProgress = [],
  error,
  disabled = false,
  className,
  label = "Property Images",
  description = "Add images of your property",
}: MultiImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFileId = () => Math.random().toString(36).substr(2, 9);

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

    const currentFileCount = files.length;
    const fileArray = Array.from(selectedFiles);

    const filesToProcess = fileArray.slice(0, maxFiles - currentFileCount);

    const filePromises = filesToProcess.map(async (file) => {
      if (file.size > maxSize) {
        console.warn(`File ${file.name} exceeds size limit`);
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
        return null;
      }
    });

    const results = await Promise.all(filePromises);

    const validFiles = results.filter(
      (result): result is FileWithPreview => result !== null
    );
    console.log("Valid files processed:", validFiles.length, "files");

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
    if (!disabled && !isUploading) {
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

    if (disabled || isUploading) return;

    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveFile = (index: number) => {
    if (disabled || isUploading) return;

    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);

    if (coverImageIndex === index) {
      onCoverImageChange(0);
    } else if (coverImageIndex > index) {
      onCoverImageChange(coverImageIndex - 1);
    }
  };

  const handleSetCoverImage = (index: number) => {
    if (disabled || isUploading) return;
    onCoverImageChange(index);
  };

  const handleAddMore = () => {
    if (!disabled && !isUploading) {
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

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <Label className="text-base font-medium">{label}</Label>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      {/* Image Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {files.map((fileWithPreview, index) => (
            <div key={fileWithPreview.id} className="relative group">
              <Card className="overflow-hidden aspect-video">
                <CardContent className="p-0 text-muted-foreground">
                  <span>{fileWithPreview.file.type}</span>

                  <Image
                    src={fileWithPreview.preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="w-full h-full object-cover rounded-md"
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
                      <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                        <div className="text-center text-dashboard-background">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                          <p className="text-xs">
                            {Math.round(uploadProgress[index])}%
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    disabled={disabled || isUploading}
                    className="absolute top-2 right-2 bg-destructive/90 hover:bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
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
                    >
                      Set as Cover
                    </button>
                  )}
                </CardContent>
              </Card>

              {/* File Info */}
              <div className="mt-1 text-center">
                <p className="text-xs text-muted-foreground truncate">
                  {fileWithPreview.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(fileWithPreview.file.size)}
                </p>
              </div>
            </div>
          ))}

          {/* Add More Button */}
          {files.length < maxFiles && (
            <Card
              className={cn(
                "aspect-video border-2 border-dashed cursor-pointer hover:border-primary/50 transition-colors",
                disabled && "opacity-50 cursor-not-allowed",
                isDragOver && "border-primary bg-primary/5"
              )}
              onClick={handleAddMore}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
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
      )}

      {/* Initial Upload Area */}
      {files.length === 0 && (
        <Card
          className={cn(
            "border-2 border-dashed transition-colors cursor-pointer",
            isDragOver && "border-primary bg-primary/5",
            disabled && "opacity-50 cursor-not-allowed",
            error && "border-destructive"
          )}
          onClick={handleAddMore}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-4">
              {isUploading ? (
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              ) : (
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isUploading ? "Uploading..." : "Add Property Images"}
              </p>
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
        disabled={disabled || isUploading || files.length >= maxFiles}
        multiple
      />

      {/* Error Display */}
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
          {error}
        </p>
      )}
    </div>
  );
}
