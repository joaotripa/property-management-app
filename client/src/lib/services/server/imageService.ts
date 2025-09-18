import { createServiceSupabaseClient } from '@/lib/integrations/supabase/server';
import {
  validateImageFile,
  getPropertyImagePath,
  ImageServiceError,
  STORAGE_BUCKET,
  type UploadResult
} from '@/lib/services/shared/imageUtils';

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

  const supabase = createServiceSupabaseClient();
  const results: UploadResult[] = [];

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

    let fileName: string;
    let counter = 1;
    do {
      fileName = `image-${Date.now()}-${counter}.${fileExtension}`;
      counter++;
    } while (existingFileNames.has(fileName));
    existingFileNames.add(fileName);

    const filePath = getPropertyImagePath(propertyId, fileName);

    try {
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