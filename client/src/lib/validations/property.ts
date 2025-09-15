import { z } from "zod";
import { PropertyType, OccupancyStatus } from "@prisma/client";

const PROPERTY_TYPES = Object.values(PropertyType) as [PropertyType, ...PropertyType[]];
const OCCUPANCY_STATUSES = Object.values(OccupancyStatus) as [OccupancyStatus, ...OccupancyStatus[]];

export const basePropertySchema = z.object({
  name: z
    .string()
    .min(1, "Property name is required")
    .min(2, "Property name must be at least 2 characters")
    .max(100, "Property name must be less than 100 characters")
    .trim(),
    
  address: z
    .string()
    .min(1, "Address is required")
    .min(2, "Address must be at least 2 characters")
    .max(200, "Address must be less than 200 characters")
    .trim(),
    
  type: z.enum(PROPERTY_TYPES, {
    message: "Please select a valid property type",
  }),
  
  rent: z
    .number({ message: "Monthly rent must be a number" })
    .positive("Monthly rent must be greater than 0")
    .max(50000, "Monthly rent cannot exceed €50,000")
    .transform((val) => Math.round(val * 100) / 100), // Round to 2 decimal places
    
  purchasePrice: z
    .number({ message: "Purchase price must be a number" })
    .positive("Purchase price must be greater than 0")
    .max(10000000, "Purchase price cannot exceed €10,000,000")
    .transform((val) => Math.round(val * 100) / 100) // Round to 2 decimal places
    .optional(),
    
  tenants: z
    .number({ message: "Number of tenants must be a number" })
    .int("Number of tenants must be a whole number")
    .min(0, "Number of tenants cannot be negative")
    .max(100, "Number of tenants cannot exceed 100"),
    
  occupancy: z.enum(OCCUPANCY_STATUSES, {
    message: "Please select a valid occupancy status",
  }),
});

export const createPropertySchema = z.object({
  name: z
    .string()
    .min(1, "Property name is required")
    .min(2, "Property name must be at least 2 characters")
    .max(100, "Property name must be less than 100 characters")
    .trim(),
    
  address: z
    .string()
    .min(1, "Address is required")
    .min(2, "Address must be at least 2 characters")
    .max(200, "Address must be less than 200 characters")
    .trim(),
    
  type: z.enum(PROPERTY_TYPES, {
    message: "Please select a valid property type",
  }),
  
  rent: z
    .string()
    .min(1, "Monthly rent is required")
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val > 0, "Monthly rent must be a valid number greater than 0")
    .refine((val) => val <= 50000, "Monthly rent cannot exceed €50,000")
    .transform((val) => Math.round(val * 100) / 100),
    
  purchasePrice: z
    .string()
    .optional()
    .transform((val) => val ? parseFloat(val) : undefined)
    .refine((val) => val === undefined || (!isNaN(val) && val > 0), "Purchase price must be a valid number greater than 0")
    .refine((val) => val === undefined || val <= 10000000, "Purchase price cannot exceed €10,000,000")
    .transform((val) => val ? Math.round(val * 100) / 100 : undefined),
    
  tenants: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= 0, "Number of tenants must be a valid whole number")
    .refine((val) => val <= 100, "Number of tenants cannot exceed 100"),
    
  occupancy: z.enum(OCCUPANCY_STATUSES, {
    message: "Please select a valid occupancy status",
  }),
});

export const updatePropertySchema = basePropertySchema.extend({
  id: z.uuid("Invalid property ID"),
});

export const propertyFormSchema = z.object({
  name: z
    .string()
    .min(1, "Property name is required")
    .min(2, "Property name must be at least 2 characters")
    .max(100, "Property name must be less than 100 characters")
    .trim(),
  address: z
    .string()
    .min(1, "Address is required")
    .min(2, "Address must be at least 2 characters")
    .max(200, "Address must be less than 200 characters")
    .trim(),
  type: z.enum(PROPERTY_TYPES, {
    message: "Please select a valid property type",
  }),
  rent: z
    .string()
    .min(1, "Monthly rent is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Monthly rent must be a valid number greater than 0",
    })
    .refine((val) => parseFloat(val) <= 50000, {
      message: "Monthly rent cannot exceed €50,000",
    }),
  purchasePrice: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) > 0), {
      message: "Purchase price must be a valid number greater than 0",
    })
    .refine((val) => !val || parseFloat(val) <= 10000000, {
      message: "Purchase price cannot exceed €10,000,000",
    }),
  tenants: z
    .string()
    .min(1, "Number of tenants is required")
    .refine((val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 0, {
      message: "Number of tenants must be a valid number",
    })
    .refine((val) => parseInt(val, 10) <= 100, {
      message: "Number of tenants cannot exceed 100",
    }),
  occupancy: z.enum(OCCUPANCY_STATUSES, {
    message: "Please select a valid occupancy status",
  }),
});

export const createPropertyRequestSchema = createPropertySchema;

export const createPropertyResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  property: z.object({
    id: z.uuid(),
    name: z.string(),
    address: z.string(),
    type: z.enum(PROPERTY_TYPES),
    rent: z.number(),
    tenants: z.number(),
    occupancy: z.enum(OCCUPANCY_STATUSES),
  }).optional(),
});

export const errorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  errors: z.record(z.string(), z.array(z.string())).optional(),
});

export const propertyIdSchema = z.uuid("Invalid property ID");

export const propertyFiltersSchema = z.object({
  type: z.enum(PROPERTY_TYPES).optional(),
  occupancy: z.enum(OCCUPANCY_STATUSES).optional(),
  minRent: z.number().positive().optional(),
  maxRent: z.number().positive().optional(),
  search: z.string().trim().optional(),
}).refine(
  (data) => {
    if (data.minRent && data.maxRent) {
      return data.minRent <= data.maxRent;
    }
    return true;
  },
  {
    message: "Minimum rent cannot be greater than maximum rent",
    path: ["minRent"],
  }
);

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type PropertyFormInput = z.infer<typeof propertyFormSchema>;
export type CreatePropertyRequest = z.infer<typeof createPropertyRequestSchema>;
export type CreatePropertyResponse = z.infer<typeof createPropertyResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type PropertyFilters = z.infer<typeof propertyFiltersSchema>;