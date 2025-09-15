// Queries
export {
  getPropertyImages,
  getPropertyCoverImage,
  getPropertyImageById,
  hasPropertyImages,
  getPropertyImagesDetailed,
} from './queries';

// Mutations
export {
  createPropertyImage,
  deletePropertyImage,
  bulkCreatePropertyImages,
  updateImageSortOrder,
  updatePropertyImageCover,
  softDeleteAllPropertyImages,
} from './mutations';

// Validation
export {
  createPropertyImageSchema,
  bulkCreatePropertyImagesSchema,
  type CreatePropertyImageInput,
  type BulkCreatePropertyImagesInput,
} from './validation';