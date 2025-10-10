import { FileWithPreview } from "@/components/ui/multi-image-upload";
import { PropertyImage } from "@prisma/client";
import {
  ImageServiceError,
  validateImageFile,
  type UploadResult,
  type PropertyImageUploadResult
} from "@/lib/services/shared/imageUtils";


/**
 * Get all property images as full PropertyImage objects from API
 */
export async function getPropertyImages(propertyId: string, signal?: AbortSignal): Promise<PropertyImage[]> {
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
 * Get all property image URLs (backwards compatibility helper)
 */
export async function getPropertyImageUrls(propertyId: string, signal?: AbortSignal): Promise<string[]> {
  const images = await getPropertyImages(propertyId, signal);
  return images.map(image => image.url);
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
 * Upload property images with cover image support
 */
export async function uploadPropertyImages(
  propertyId: string,
  images: FileWithPreview[] | File[],
  coverImageIndex: number = 0,
  signal?: AbortSignal
): Promise<PropertyImageUploadResult> {
  try {
    if (images.length === 0) {
      throw new ImageServiceError('No images to upload');
    }

    if (!propertyId || typeof propertyId !== 'string') {
      throw new ImageServiceError('Valid property ID is required');
    }

    const files = images.map(img =>
      'file' in img ? (img as FileWithPreview).file : (img as File)
    );

    for (let i = 0; i < files.length; i++) {
      const validation = validateImageFile(files[i]);
      if (!validation.isValid) {
        throw new ImageServiceError(`File ${i + 1}: ${validation.error}`);
      }
    }

    const formData = new FormData();
    formData.append('coverImageIndex', coverImageIndex.toString());

    files.forEach((file, index) => {
      formData.append(`file-${index}`, file);
    });

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
      }
      throw new ImageServiceError(errorMessage, fetchResponse.status);
    }

    const response = await fetchResponse.json();

    if (!response?.results || !Array.isArray(response.results)) {
      throw new ImageServiceError('Invalid response structure from server');
    }

    return { results: response.results };

  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ImageServiceError('Request cancelled', 0);
    }

    if (error instanceof ImageServiceError) {
      throw error;
    }

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
 * Update which image is the cover image for a property
 */
export async function updatePropertyCoverImage(
  propertyId: string,
  imageFilename: string,
  signal?: AbortSignal
): Promise<void> {
  try {
    if (!propertyId || typeof propertyId !== 'string') {
      throw new ImageServiceError('Valid property ID is required');
    }

    if (!imageFilename || typeof imageFilename !== 'string') {
      throw new ImageServiceError('Valid image filename is required');
    }

    const response = await fetch(`/api/properties/${propertyId}/images/cover`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageFilename }),
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
        // If we can't parse the error response, use the default message
      }

      throw new ImageServiceError(errorMessage, response.status);
    }

    const data = await response.json();
    if (!data.success) {
      throw new ImageServiceError(
        data.message || 'Failed to update cover image'
      );
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
 * Upload single image to Supabase Storage (backward compatibility)
 */
export async function uploadPropertyImage(
  file: File,
  propertyId: string
): Promise<UploadResult> {
  const results = await uploadPropertyImages(
    propertyId,
    [file],
    0
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
 * Extract path from Supabase public URL
 */
export function extractPathFromUrl(url: string): string {
  if (!url.includes('storage/v1/object/public/property-images/')) {
    return url;
  }

  return url.split('storage/v1/object/public/property-images/')[1];
}