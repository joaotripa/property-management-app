import { z } from "zod";

export const userSettingsSchema = z.object({
  currencyId: z.uuid("Invalid currency ID"),
  timezoneId: z.uuid("Invalid timezone ID"),
});

export const updateUserSettingsSchema = userSettingsSchema;

export const userSettingsFormSchema = z.object({
  currencyId: z.string().min(1, "Currency is required"),
  timezoneId: z.string().min(1, "Timezone is required"),
});

export const currencySchema = z.object({
  id: z.uuid(),
  code: z.string(),
  symbol: z.string(),
  name: z.string(),
  isActive: z.boolean(),
});

export const timezoneSchema = z.object({
  id: z.uuid(),
  iana: z.string(),
  label: z.string(),
  isActive: z.boolean(),
});

export const userSettingsResponseSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  currencyId: z.uuid(),
  timezoneId: z.uuid(),
  hasCompletedOnboarding: z.boolean(),
  currency: currencySchema,
  timezone: timezoneSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const currenciesResponseSchema = z.array(currencySchema);
export const timezonesResponseSchema = z.array(timezoneSchema);

export const updateUserSettingsRequestSchema = updateUserSettingsSchema;

export const updateUserSettingsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  userSettings: userSettingsResponseSchema.optional(),
});

export const errorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  errors: z.record(z.string(), z.array(z.string())).optional(),
});

export type UserSettingsInput = z.infer<typeof userSettingsSchema>;
export type UserSettingsFormInput = z.infer<typeof userSettingsFormSchema>;
export type Currency = z.infer<typeof currencySchema>;
export type Timezone = z.infer<typeof timezoneSchema>;
export type UserSettingsResponse = z.infer<typeof userSettingsResponseSchema>;
export type CurrenciesResponse = z.infer<typeof currenciesResponseSchema>;
export type TimezonesResponse = z.infer<typeof timezonesResponseSchema>;
export type UpdateUserSettingsRequest = z.infer<typeof updateUserSettingsRequestSchema>;
export type UpdateUserSettingsResponse = z.infer<typeof updateUserSettingsResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;