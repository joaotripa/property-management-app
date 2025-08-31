import { generateUUID } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";

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

/**
 * Create a preview URL for a file
 */
export function createFilePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Upload multiple images to Supabase Storage via API route
 */
export async function uploadPropertyImages(
  files: File[],
  propertyId: string,
  coverImageIndex: number = 0,
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<UploadResult[]> {
  if (files.length === 0) {
    throw new Error('No files to upload');
  }

  // Client-side validation
  for (let i = 0; i < files.length; i++) {
    const validation = validateImageFile(files[i]);
    if (!validation.isValid) {
      throw new Error(`File ${i + 1}: ${validation.error}`);
    }
  }

  try {
    const formData = new FormData();
    formData.append('propertyId', propertyId);
    formData.append('coverImageIndex', coverImageIndex.toString());
    
    files.forEach((file, index) => {
      formData.append(`file-${index}`, file);
      onProgress?.(index, 0);
    });

    const response = await fetch(`/api/properties/${propertyId}/images`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const { results } = await response.json();
    
    files.forEach((_, index) => {
      onProgress?.(index, 100);
    });

    return results;
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error instanceof Error ? error : new Error('Upload failed');
  }
}

/**
 * Upload single image to Supabase Storage (backward compatibility)
 */
export async function uploadPropertyImage(
  file: File,
  propertyId: string
): Promise<UploadResult> {
  const results = await uploadPropertyImages([file], propertyId, 0);
  return results[0];
}

/**
 * Delete specific property image from Supabase Storage via API route
 */
export async function deletePropertyImage(propertyId: string, filename?: string): Promise<void> {
  try {
    let deleteUrl = `/api/properties/${propertyId}/images`;
    if (filename) {
      deleteUrl = `/api/properties/${propertyId}/images/${filename}`;
    }

    const response = await fetch(deleteUrl, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Delete operation failed');
    }
  } catch (error) {
    console.error('Error deleting property image(s):', error);
    throw error instanceof Error ? error : new Error('Delete operation failed');
  }
}


/**
 * Get property cover image URL from Supabase Storage
 */
export function getPropertyCoverImageUrl(propertyId: string): string {
  const { data } = supabase.storage
    .from('property-images')
    .getPublicUrl(`${propertyId}/cover-image.jpg`);

  return data.publicUrl;
}

/**
 * Get all property image URLs from Supabase Storage via API route
 */
export async function getPropertyImageUrls(propertyId: string): Promise<string[]> {
  try {
    const response = await fetch(`/api/properties/${propertyId}/images?action=list`);
    
    if (!response.ok) {
      console.error('Failed to fetch property images');
      return [];
    }

    const { imageUrls } = await response.json();
    return imageUrls || [];
  } catch (error) {
    console.error('Error fetching property images:', error);
    return [];
  }
}

/**
 * Get property image URL from Supabase Storage (backward compatibility)
 */
export function getPropertyImageUrl(propertyId: string): string {
  return getPropertyCoverImageUrl(propertyId);
}

/**
 * Check if property has an image in storage via API route
 */
export async function hasPropertyImage(propertyId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/properties/${propertyId}/images?action=check`);
    
    if (!response.ok) {
      return false;
    }

    const { hasImages } = await response.json();
    return hasImages || false;
  } catch {
    return false;
  }
}

/**
 * Get public URL for an image in Supabase Storage
 */
export function getPublicImageUrl(path: string): string {
  if (path.startsWith('http')) {
    return path;
  }

  const { data } = supabase.storage
    .from('property-images')
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Extract path from Supabase public URL
 */
export function extractPathFromUrl(url: string): string {
  if (!url.includes('storage/v1/object/public/property-images/')) {
    return url; 
  }

  return url.split('storage/v1/object/public/property-images/')[1];
}

/**
 * Resize image client-side before upload (optional optimization)
 */
export function resizeImage(
  file: File, 
  maxWidth: number = 1200, 
  maxHeight: number = 800, 
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Failed to resize image'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}