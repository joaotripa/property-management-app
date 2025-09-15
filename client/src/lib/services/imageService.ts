import { FileWithPreview } from "@/components/ui/multi-image-upload";
import { generateUUID } from "@/lib/utils";

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

export interface PropertyImageData {
  url: string;
  filename: string;
  key: string;
  isCover: boolean;
}

/**
 * Get all property image URLs from API
 */
export async function getPropertyImages(propertyId: string, signal?: AbortSignal): Promise<string[]> {
  try {
    const response = await fetch(`/api/properties/${propertyId}/images`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      throw new ImageServiceError(
        `Failed to fetch property images: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data.imageUrls || [];
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return [];
    }

    if (error instanceof ImageServiceError) {
      throw error;
    }

    throw new ImageServiceError(
      'Network error while fetching property images'
    );
  }
}

/**
 * Get detailed property image data including filenames and keys
 */
export async function getPropertyImageData(propertyId: string, signal?: AbortSignal): Promise<PropertyImageData[]> {
  try {
    const response = await fetch(`/api/properties/${propertyId}/images`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      throw new ImageServiceError(
        `Failed to fetch property images: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data.images || [];
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return [];
    }

    if (error instanceof ImageServiceError) {
      throw error;
    }

    throw new ImageServiceError(
      'Network error while fetching property images'
    );
  }
}

/**
 * Delete a specific property image
 */
export async function deletePropertyImage(
  propertyId: string,
  imageId: string,
  signal?: AbortSignal
): Promise<void> {
  try {
    const response = await fetch(`/api/properties/${propertyId}/images/${imageId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      let errorMessage = `Failed to delete image: ${response.statusText}`;

      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // If we can't parse the error response, use the default message
      }

      throw new ImageServiceError(errorMessage, response.status);
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ImageServiceError('Request cancelled', 0);
    }

    if (error instanceof ImageServiceError) {
      throw error;
    }

    throw new ImageServiceError(
      'Network error while deleting property image'
    );
  }
}

/**
 * Upload multiple images with real-time progress tracking
 */
async function uploadWithProgress(
  formData: FormData,
  url: string,
  onProgress: (progress: number) => void
): Promise<{ results: UploadResult[] }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(Math.min(progress, 99)); // Keep at 99% until complete
      }
    });

    // Handle successful completion
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          onProgress(100);
          resolve(response);
        } catch (parseError) {
          console.error('Invalid response format from server:', parseError);
          reject(new ImageServiceError('Invalid response format from server'));
        }
      } else {
        // Handle HTTP error responses
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          reject(new ImageServiceError(errorResponse.error || `HTTP ${xhr.status}: Upload failed`, xhr.status));
        } catch {
          reject(new ImageServiceError(`HTTP ${xhr.status}: Upload failed`, xhr.status));
        }
      }
    });

    // Handle network errors
    xhr.addEventListener('error', () => {
      reject(new ImageServiceError('Network error occurred during upload'));
    });

    // Handle timeout
    xhr.addEventListener('timeout', () => {
      reject(new ImageServiceError('Upload timed out'));
    });

    // Configure and send request
    xhr.open('POST', url);
    xhr.timeout = 5 * 60 * 1000; // 5 minutes timeout
    xhr.send(formData);
  });
}

/**
 * Upload property images with cover image support and progress tracking
 */
export async function uploadPropertyImages(
  propertyId: string,
  images: FileWithPreview[] | File[],
  coverImageIndex: number = 0,
  onProgress?: (fileIndex: number, progress: number) => void,
  signal?: AbortSignal
): Promise<PropertyImageUploadResult> {
  try {
    if (images.length === 0) {
      throw new ImageServiceError('No images to upload');
    }

    if (!propertyId || typeof propertyId !== 'string') {
      throw new ImageServiceError('Valid property ID is required');
    }

    // Convert to File[] for validation if needed
    const files = images.map(img =>
      'file' in img ? (img as FileWithPreview).file : (img as File)
    );

    // Client-side validation
    for (let i = 0; i < files.length; i++) {
      const validation = validateImageFile(files[i]);
      if (!validation.isValid) {
        throw new ImageServiceError(`File ${i + 1}: ${validation.error}`);
      }
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('coverImageIndex', coverImageIndex.toString());

    files.forEach((file, index) => {
      formData.append(`file-${index}`, file);
    });

    // Initialize progress for all files
    files.forEach((_, index) => {
      onProgress?.(index, 0);
    });

    let response: { results: UploadResult[] };

    if (signal) {
      // Use regular fetch with abort signal
      const fetchResponse = await fetch(`/api/properties/${propertyId}/images`, {
        method: 'POST',
        body: formData,
        signal,
      });

      if (!fetchResponse.ok) {
        let errorMessage = `Failed to upload images: ${fetchResponse.statusText}`;
        try {
          const errorData = await fetchResponse.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // Use default message
        }
        throw new ImageServiceError(errorMessage, fetchResponse.status);
      }

      response = await fetchResponse.json();
    } else {
      // Use XMLHttpRequest with progress tracking
      response = await uploadWithProgress(
        formData,
        `/api/properties/${propertyId}/images`,
        (overallProgress) => {
          // Distribute progress evenly across all files
          files.forEach((_, index) => {
            onProgress?.(index, overallProgress);
          });
        }
      );
    }

    // Validate response structure
    if (!response?.results || !Array.isArray(response.results)) {
      throw new ImageServiceError('Invalid response structure from server');
    }

    return { results: response.results };

  } catch (error) {
    // Reset progress on error
    if (onProgress) {
      const files = images.map(img =>
        'file' in img ? (img as FileWithPreview).file : (img as File)
      );
      files.forEach((_, index) => {
        onProgress(index, 0);
      });
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ImageServiceError('Request cancelled', 0);
    }

    if (error instanceof ImageServiceError) {
      throw error;
    }

    // Log error for debugging (in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('Upload error:', error);
    }

    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    throw new ImageServiceError(`Failed to upload property images: ${errorMessage}`);
  }
}

/**
 * Get property cover image URL
 */
export async function getPropertyCoverImage(propertyId: string, signal?: AbortSignal): Promise<string | null> {
  try {
    const response = await fetch(`/api/properties/${propertyId}/images/cover`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new ImageServiceError(
        `Failed to fetch cover image: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data.coverImageUrl || null;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return null;
    }

    if (error instanceof ImageServiceError) {
      throw error;
    }

    throw new ImageServiceError(
      'Network error while fetching cover image'
    );
  }
}

/**
 * Upload single image to Supabase Storage (backward compatibility)
 */
export async function uploadPropertyImage(
  file: File,
  propertyId: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  const results = await uploadPropertyImages(
    propertyId,
    [file],
    0,
    onProgress ? (_, progress) => onProgress(progress) : undefined
  );
  return results.results[0];
}

/**
 * Check if property has an image in storage via API route
 */
export async function hasPropertyImage(propertyId: string, signal?: AbortSignal): Promise<boolean> {
  try {
    const response = await fetch(`/api/properties/${propertyId}/images?action=check`, {
      signal
    });

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

/**
 * Internal function to handle S3 upload operations for API routes
 */
export async function handlePropertyImageUpload(
  propertyId: string,
  files: File[],
  coverImageIndex: number = 0
): Promise<UploadResult[]> {
  if (!propertyId || typeof propertyId !== 'string') {
    throw new ImageServiceError('Valid property ID is required');
  }

  if (files.length === 0) {
    throw new ImageServiceError('No files to upload');
  }

  const { getS3Client, STORAGE_BUCKET, getPropertyImagePath } = await import('@/lib/supabase/s3-client');
  const { PutObjectCommand, ListObjectsV2Command, GetObjectCommand } = await import('@aws-sdk/client-s3');
  const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

  const results: UploadResult[] = [];
  const s3Client = getS3Client();

  const listCommand = new ListObjectsV2Command({
    Bucket: STORAGE_BUCKET,
    Prefix: `${propertyId}/`,
  });
  const existingFiles = await s3Client.send(listCommand);
  const existingFileNames = new Set(
    existingFiles.Contents?.map(obj => obj.Key?.split('/').pop()?.split('?')[0]) || []
  );

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      throw new ImageServiceError(`File ${i + 1}: ${validation.error}`);
    }

    const fileExtension = file.name.split('.').pop();
    const isCover = i === coverImageIndex;

    // Generate unique filename for all images (no special cover naming)
    let fileName: string;
    let counter = 1;
    do {
      fileName = `image-${Date.now()}-${counter}.${fileExtension}`;
      counter++;
    } while (existingFileNames.has(fileName));
    existingFileNames.add(fileName);

    const filePath = getPropertyImagePath(propertyId, fileName);

    try {
      const fileBuffer = await file.arrayBuffer();

      const uploadCommand = new PutObjectCommand({
        Bucket: STORAGE_BUCKET,
        Key: filePath,
        Body: new Uint8Array(fileBuffer),
        ContentType: file.type,
        CacheControl: 'max-age=3600',
        Metadata: {
          'uploaded-by': 'domari.app',
          'property-id': propertyId,
          'file-index': i.toString(),
          'is-cover': isCover.toString(),
        }
      });

      await s3Client.send(uploadCommand);

      const getCommand = new GetObjectCommand({
        Bucket: STORAGE_BUCKET,
        Key: filePath,
      });

      const publicUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });

      results.push({
        url: publicUrl,
        path: filePath,
        size: file.size,
      });
    } catch (error) {
      console.error(`Error uploading file ${i + 1}:`, error);
      throw new ImageServiceError(`Upload failed for file ${i + 1}`);
    }
  }

  return results;
}

/**
 * Update which existing image is the cover image for a property
 */
export async function updatePropertyCoverImage(
  propertyId: string,
  newCoverImageId: string,
  signal?: AbortSignal
): Promise<void> {
  try {
    if (!propertyId || typeof propertyId !== 'string') {
      throw new ImageServiceError('Valid property ID is required');
    }

    if (!newCoverImageId || typeof newCoverImageId !== 'string') {
      throw new ImageServiceError('Valid image ID is required');
    }

    const response = await fetch(`/api/properties/${propertyId}/images/cover`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageId: newCoverImageId }),
      signal,
    });

    if (!response.ok) {
      let errorMessage = `Failed to update cover image: ${response.statusText}`;

      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
      }

      throw new ImageServiceError(errorMessage, response.status);
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ImageServiceError('Request cancelled', 0);
    }

    if (error instanceof ImageServiceError) {
      throw error;
    }

    throw new ImageServiceError(
      'Network error while updating cover image'
    );
  }
}

/**
 * Server-side function to handle cover image designation using metadata (no file renaming)
 */
export async function handleCoverImageUpdate(
  propertyId: string,
  imageId: string
): Promise<void> {
  if (!propertyId || typeof propertyId !== 'string') {
    throw new ImageServiceError('Valid property ID is required');
  }

  if (!imageId || typeof imageId !== 'string') {
    throw new ImageServiceError('Valid image ID is required');
  }

  const { getS3Client, STORAGE_BUCKET } = await import('@/lib/supabase/s3-client');
  const { CopyObjectCommand, ListObjectsV2Command } = await import('@aws-sdk/client-s3');

  const s3Client = getS3Client();

  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: STORAGE_BUCKET,
      Prefix: `${propertyId}/`,
    });

    const existingFiles = await s3Client.send(listCommand);
    const images = existingFiles.Contents || [];

    const targetImage = images.find(obj => {
      if (!obj.Key) return false;
      const filename = obj.Key.split('/').pop()?.split('?')[0];
      return filename === imageId;
    });

    if (!targetImage || !targetImage.Key) {
      throw new ImageServiceError(`Target image not found. Looking for: ${imageId}`);
    }

    for (const image of images) {
      if (!image.Key) continue;

      const copyCommand = new CopyObjectCommand({
        Bucket: STORAGE_BUCKET,
        CopySource: `${STORAGE_BUCKET}/${image.Key}`,
        Key: image.Key,
        MetadataDirective: 'REPLACE',
        Metadata: {
          'uploaded-by': 'domari.app',
          'property-id': propertyId,
          'is-cover': 'false',
        },
      });

      await s3Client.send(copyCommand);
    }

    const setCoverCommand = new CopyObjectCommand({
      Bucket: STORAGE_BUCKET,
      CopySource: `${STORAGE_BUCKET}/${targetImage.Key}`,
      Key: targetImage.Key,
      MetadataDirective: 'REPLACE',
      Metadata: {
        'uploaded-by': 'domari.app',
        'property-id': propertyId,
        'is-cover': 'true',
      },
    });

    await s3Client.send(setCoverCommand);

  } catch (error) {
    console.error('Error updating cover image:', error);

    if (error instanceof ImageServiceError) {
      throw error;
    }

    throw new ImageServiceError(
      `Failed to update cover image: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}