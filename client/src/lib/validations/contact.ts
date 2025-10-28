import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(1, "Please enter your name"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(1, "Please enter a subject"),
  message: z
    .string()
    .min(10, "Please enter a message (at least 10 characters)")
    .max(1000, "Message must be less than 1000 characters"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
