import { generateUUID } from "@/lib/utils/index";

export class ImageServiceError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'ImageServiceError';
  }
}

export interface PropertyImageUploadResult {
  results: {
    url: string;
    path: string;
    size: number;
  }[];
}

export interface UploadResult {
  url: string;
  path: string;
  size: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export const STORAGE_BUCKET = 'property-images';

/**
 * Validate file before upload
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const isImage = file.type.startsWith('image/');

  if (!isImage) {
    return { isValid: false, error: 'Please select an image file' };
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    const maxSizeText = '5MB';
    return { isValid: false, error: `Please select a file smaller than ${maxSizeText}` };
  }

  const allowedImageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  const allowedExtensions = [...allowedImageExtensions];

  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: `Please select a valid file type (${allowedExtensions.join(', ')})`
    };
  }

  return { isValid: true };
}

/**
 * Validate multiple files for property upload
 */
export function validatePropertyFiles(files: File[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (files.length > 10) {
    errors.push('Maximum 10 files allowed per property');
  }

  files.forEach((file, index) => {
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      errors.push(`File ${index + 1}: ${validation.error}`);
    }
  });

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const maxTotalSize = 100 * 1024 * 1024; // 100MB
  if (totalSize > maxTotalSize) {
    errors.push('Total file size cannot exceed 100MB');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate a unique filename for the uploaded file
 */
export function generateFileName(originalName: string, prefix: string = 'property'): string {
  const extension = originalName.split('.').pop();
  const uuid = generateUUID();
  const timestamp = Date.now();
  return `${prefix}_${timestamp}_${uuid}.${extension}`;
}

export function getPropertyImagePath(propertyId: string, fileName: string): string {
  return `${propertyId}/${fileName}`;
}