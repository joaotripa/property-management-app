import { createServiceSupabaseClient } from '@/lib/supabase/server';
import {
  validateImageFile,
  getPropertyImagePath,
  ImageServiceError,
  STORAGE_BUCKET,
  type UploadResult
} from './imageService';

/**
 * Server-side function to handle Supabase storage upload operations for API routes
 * Uses service role client to bypass RLS policies after proper authentication/authorization
 */
export async function handlePropertyImageUpload(
  propertyId: string,
  files: File[]
): Promise<UploadResult[]> {
  if (!propertyId || typeof propertyId !== 'string') {
    throw new ImageServiceError('Valid property ID is required');
  }

  if (files.length === 0) {
    throw new ImageServiceError('No files to upload');
  }

  // Use service role client (bypasses RLS - auth/authz already done in API route)
  const supabase = createServiceSupabaseClient();
  const results: UploadResult[] = [];

  // List existing files to avoid name conflicts
  const { data: existingFiles } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list(`${propertyId}/`);

  const existingFileNames = new Set(
    existingFiles?.map(file => file.name) || []
  );

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      throw new ImageServiceError(`File ${i + 1}: ${validation.error}`);
    }

    const fileExtension = file.name.split('.').pop();

    // Generate unique filename
    let fileName: string;
    let counter = 1;
    do {
      fileName = `image-${Date.now()}-${counter}.${fileExtension}`;
      counter++;
    } while (existingFileNames.has(fileName));
    existingFileNames.add(fileName);

    const filePath = getPropertyImagePath(propertyId, fileName);

    try {
      // Upload to Supabase Storage using service role (bypasses RLS)
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Get public URL (bucket is public)
      const { data: publicUrlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      results.push({
        url: publicUrlData.publicUrl,
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