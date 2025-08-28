import { generateUUID } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { getS3Client, STORAGE_BUCKET, getPropertyImagePath } from "@/lib/supabase/s3-client";
import { PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

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
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Please select an image file' };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'Please select an image smaller than 5MB' };
  }

  // Check file extension
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    return { 
      isValid: false, 
      error: `Please select a valid image file (${allowedExtensions.join(', ')})` 
    };
  }

  return { isValid: true };
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
 * Upload image to Supabase Storage using direct S3 connection for better performance
 */
export async function uploadPropertyImage(
  file: File,
  propertyId: string
): Promise<UploadResult> {
  // Validate file first
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // Generate filename for property folder: property-images/{propertyId}/image.ext
  const fileExtension = file.name.split('.').pop();
  const fileName = `image.${fileExtension}`;
  const filePath = getPropertyImagePath(propertyId, fileName);
  
  try {
    // Convert file to buffer for S3 upload
    const fileBuffer = await file.arrayBuffer();

    // Upload directly to S3 using AWS SDK for better performance
    const uploadCommand = new PutObjectCommand({
      Bucket: STORAGE_BUCKET,
      Key: filePath,
      Body: new Uint8Array(fileBuffer),
      ContentType: file.type,
      CacheControl: 'max-age=3600',
      Metadata: {
        'uploaded-by': 'domari.app',
        'property-id': propertyId,
      }
    });

    const s3Client = getS3Client();
    await s3Client.send(uploadCommand);
    
    // Construct public URL
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${filePath}`;
    
    return {
      url: publicUrl,
      path: filePath,
      size: file.size,
    };
  } catch (error) {
    console.error('Error uploading image with S3:', error);
    throw error instanceof Error ? error : new Error('S3 upload failed');
  }
}

/**
 * Delete property image from Supabase Storage using direct S3 connection
 */
export async function deletePropertyImage(propertyId: string): Promise<void> {
  try {
    // List all files in the property folder using S3
    const listCommand = new ListObjectsV2Command({
      Bucket: STORAGE_BUCKET,
      Prefix: `${propertyId}/`,
    });

    const s3Client = getS3Client();
    const listResult = await s3Client.send(listCommand);

    if (listResult.Contents && listResult.Contents.length > 0) {
      // Delete all files in the property folder
      for (const obj of listResult.Contents) {
        if (obj.Key) {
          const deleteCommand = new DeleteObjectCommand({
            Bucket: STORAGE_BUCKET,
            Key: obj.Key,
          });
          await s3Client.send(deleteCommand);
        }
      }
    }
  } catch (error) {
    console.error('Error deleting property images with S3:', error);
    throw error instanceof Error ? error : new Error('S3 delete failed');
  }
}

/**
 * Get property image URL from Supabase Storage
 */
export function getPropertyImageUrl(propertyId: string): string {
  const { data } = supabase.storage
    .from('property-images')
    .getPublicUrl(`${propertyId}/image.jpg`); // Default to .jpg, could be enhanced to check actual extension

  return data.publicUrl;
}

/**
 * Check if property has an image in storage using S3 direct connection
 */
export async function hasPropertyImage(propertyId: string): Promise<boolean> {
  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: STORAGE_BUCKET,
      Prefix: `${propertyId}/`,
      MaxKeys: 1, // We only need to check if any files exist
    });

    const s3Client = getS3Client();
    const result = await s3Client.send(listCommand);
    return Boolean(result.Contents && result.Contents.length > 0);
  } catch {
    return false;
  }
}

/**
 * Get public URL for an image in Supabase Storage
 */
export function getPublicImageUrl(path: string): string {
  // If path is already a full URL, return as is
  if (path.startsWith('http')) {
    return path;
  }

  // Get public URL from Supabase client
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
    return url; // Return as is if it's not a Supabase URL
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
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
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