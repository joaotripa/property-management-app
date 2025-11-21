import { z } from "zod";
import { PropertyType, OccupancyStatus } from "@prisma/client";

const PROPERTY_TYPES = Object.values(PropertyType) as [PropertyType, ...PropertyType[]];
const OCCUPANCY_STATUSES = Object.values(OccupancyStatus) as [OccupancyStatus, ...OccupancyStatus[]];

// Non-transforming schema for form inputs (validation only)
export const propertyFormInputSchema = z.object({
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
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0 && num <= 50000;
    }, "Monthly rent must be a valid number between 0 and 50,000"),

  purchasePrice: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num > 0 && num <= 10000000;
    }, "Purchase price must be a valid number between 0 and 10,000,000"),

  tenants: z
    .string()
    .refine((val) => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 0 && num <= 100;
    }, "Number of tenants must be a valid whole number between 0 and 100"),

  occupancy: z.enum(OCCUPANCY_STATUSES, {
    message: "Please select a valid occupancy status",
  }),
});

// Transforming schema for API/mutations (converts strings to numbers)
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
    .refine((val) => val <= 50000, "Monthly rent cannot exceed 50,000")
    .transform((val) => Math.round(val * 100) / 100),

  purchasePrice: z
    .string()
    .optional()
    .transform((val) => val ? parseFloat(val) : undefined)
    .refine((val) => val === undefined || (!isNaN(val) && val > 0), "Purchase price must be a valid number greater than 0")
    .refine((val) => val === undefined || val <= 10000000, "Purchase price cannot exceed 10,000,000")
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
    .max(50000, "Monthly rent cannot exceed 50,000")
    .transform((val) => Math.round(val * 100) / 100),

  purchasePrice: z
    .number({ message: "Purchase price must be a number" })
    .positive("Purchase price must be greater than 0")
    .max(10000000, "Purchase price cannot exceed 10,000,000")
    .transform((val) => Math.round(val * 100) / 100)
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

export const updatePropertySchema = basePropertySchema.extend({
  id: z.uuid("Invalid property ID"),
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

export type PropertyFormInput = z.infer<typeof propertyFormInputSchema>;
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type CreatePropertyRequest = z.infer<typeof createPropertyRequestSchema>;
export type CreatePropertyResponse = z.infer<typeof createPropertyResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type PropertyFilters = z.infer<typeof propertyFiltersSchema>;
