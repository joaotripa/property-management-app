// Queries
export {
  getUserProperties,
  getPropertyById,
  getPropertyOptions,
  getPropertyStats,
} from './queries';

// Mutations
export {
  createProperty,
  updateProperty,
  deleteProperty,
  restoreProperty,
  updatePropertyOccupancy,
} from './mutations';

// Validation
export {
  validatePropertyAccess,
  isPropertyNameUnique,
  validatePropertyExists,
  hasPropertyTransactions,
  getPropertyOwnership,
  validatePropertyConstraints,
} from './validation';

// Re-export validation schemas for convenience
export {
  propertyFormInputSchema,
  createPropertySchema,
  updatePropertySchema,
  createPropertyRequestSchema,
  createPropertyResponseSchema,
  errorResponseSchema,
  propertyIdSchema,
  propertyFiltersSchema,
} from '@/lib/validations/property';

// Re-export types for convenience
export type {
  PropertyFormInput,
  CreatePropertyInput,
  UpdatePropertyInput,
  CreatePropertyRequest,
  CreatePropertyResponse,
  ErrorResponse,
  PropertyFilters,
} from '@/lib/validations/property';