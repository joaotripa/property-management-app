import { z } from "zod";
import { PropertyType } from "@prisma/client";

const basePropertySchema = z.object({
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
    
  type: z.nativeEnum(PropertyType, {
    message: "Please select a valid property type",
  }),
  
  rent: z
    .number({ message: "Monthly rent must be a number" })
    .positive("Monthly rent must be greater than 0")
    .max(50000, "Monthly rent cannot exceed €50,000")
    .transform((val) => Math.round(val * 100) / 100), // Round to 2 decimal places
    
  tenants: z
    .number({ message: "Number of tenants must be a number" })
    .int("Number of tenants must be a whole number")
    .min(0, "Number of tenants cannot be negative")
    .max(100, "Number of tenants cannot exceed 100"),
    
  occupancy: z
    .enum(["Available", "Occupied"], {
      message: "Please select a valid occupancy status",
    }),
});

export const createPropertySchema = basePropertySchema;

export const updatePropertySchema = basePropertySchema.extend({
  id: z.string().uuid("Invalid property ID"),
});

// Schema for property form inputs (before transformation)
export const propertyFormSchema = z.object({
  name: z.string().min(1, "Property name is required").trim(),
  address: z.string().min(1, "Address is required").trim(),
  type: z.nativeEnum(PropertyType),
  rent: z.string().min(1, "Monthly rent is required").transform((val) => {
    const num = parseFloat(val);
    if (isNaN(num)) throw new Error("Monthly rent must be a valid number");
    if (num <= 0) throw new Error("Monthly rent must be greater than 0");
    if (num > 50000) throw new Error("Monthly rent cannot exceed €50,000");
    return num;
  }),
  tenants: z.string().min(1, "Number of tenants is required").transform((val) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) throw new Error("Number of tenants must be a valid number");
    if (num < 0) throw new Error("Number of tenants cannot be negative");
    if (num > 100) throw new Error("Number of tenants cannot exceed 100");
    return num;
  }),
  occupancy: z.enum(["Available", "Occupied"]),
});

export const createPropertyRequestSchema = createPropertySchema;

export const createPropertyResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  property: z.object({
    id: z.string().uuid(),
    name: z.string(),
    address: z.string(),
    type: z.nativeEnum(PropertyType),
    rent: z.number(),
    tenants: z.number(),
    occupancy: z.enum(["Available", "Occupied"]),
  }).optional(),
});

export const errorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  errors: z.record(z.string(), z.array(z.string())).optional(),
});

export const propertyIdSchema = z.string().uuid("Invalid property ID");

export const propertyFiltersSchema = z.object({
  type: z.nativeEnum(PropertyType).optional(),
  occupancy: z.enum(["Available", "Occupied"]).optional(),
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