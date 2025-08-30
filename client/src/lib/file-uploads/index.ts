// Supabase upload utilities
export {
  uploadPropertyImage,
  uploadPropertyImages,
  deletePropertyImage,
  getPropertyImageUrl,
  getPropertyCoverImageUrl,
  getPropertyImageUrls,
  setPropertyCoverImage,
  hasPropertyImage,
  validateImageFile,
  validatePropertyFiles,
  generateFileName,
  createFilePreview,
  getPublicImageUrl,
  extractPathFromUrl,
  resizeImage,
} from './supabase-upload';

// Types
export type {
  UploadResult,
  UploadProgress,
} from './supabase-upload';

// Re-export for convenience
export * from './supabase-upload';