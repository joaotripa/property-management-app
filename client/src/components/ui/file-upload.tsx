"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/index";
import Image from "next/image";

export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  accept?: string;
  maxSize?: number;
  preview?: string | null;
  isUploading?: boolean;
  uploadProgress?: number;
  error?: string | null;
  disabled?: boolean;
  className?: string;
  label?: string;
  description?: string;
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB
  preview,
  isUploading = false,
  uploadProgress = 0,
  error,
  disabled = false,
  className,
  label = "Upload file",
  description = "Click to upload or drag and drop",
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file.size > maxSize) {
      return;
    }
    onFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
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

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (preview) {
    return (
      <div className={cn("space-y-4", className)}>
        <Label>{label}</Label>
        <Card className="relative overflow-hidden">
          <div className="relative">
            <Image
              src={preview}
              alt="Preview"
              width={400}
              height={300}
              className="w-full aspect-video object-cover"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onFileRemove}
                disabled={disabled || isUploading}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>
          
          {isUploading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <div className="text-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Uploading... {Math.round(uploadProgress)}%
                </p>
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </Card>
        
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Label>{label}</Label>
      
      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragOver && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-destructive"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-4">
            {isUploading ? (
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {isUploading ? "Uploading..." : description}
            </p>
            <p className="text-xs text-muted-foreground">
              {accept.includes('image') && `Images up to ${formatFileSize(maxSize)}`}
            </p>
          </div>

          {isUploading && uploadProgress > 0 && (
            <div className="mt-4 w-full max-w-xs">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}