import { z } from "zod";

export const rentalYieldSchema = z.object({
  purchasePrice: z
    .number()
    .min(1000, "Purchase price must be at least €1,000")
    .max(100000000, "Purchase price must be less than €100,000,000"),
  monthlyRent: z
    .number()
    .min(0, "Monthly rent cannot be negative")
    .max(1000000, "Monthly rent must be less than €1,000,000"),
  monthlyExpenses: z
    .number()
    .min(0, "Monthly expenses cannot be negative")
    .max(100000, "Monthly expenses must be less than €100,000"),
  annualPropertyTax: z
    .number()
    .min(0, "Annual property tax cannot be negative")
    .max(100000, "Annual property tax must be less than €100,000"),
  vacancyRate: z
    .number()
    .min(0, "Vacancy rate cannot be negative")
    .max(20, "Vacancy rate cannot exceed 20%"),
  managementFee: z
    .number()
    .min(0, "Management fee cannot be negative")
    .max(20, "Management fee cannot exceed 20%"),
});

export type RentalYieldFormData = z.infer<typeof rentalYieldSchema>;
