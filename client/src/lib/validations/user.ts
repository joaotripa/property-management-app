import { z } from "zod";

export const deleteAccountSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  confirmDeletion: z.boolean().refine((val) => val === true, {
    message: "You must confirm that you want to delete your account",
  }),
});

export const deleteAccountApiSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;
export type DeleteAccountApiInput = z.infer<typeof deleteAccountApiSchema>;
