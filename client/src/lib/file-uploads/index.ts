// Supabase upload utilities
export {
  uploadPropertyImage,
  deletePropertyImage,
  getPropertyImageUrl,
  hasPropertyImage,
  validateImageFile,
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