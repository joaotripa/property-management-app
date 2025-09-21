import { z } from "zod";
import { TransactionType } from "@prisma/client"
const TRANSACTION_TYPES = Object.values(TransactionType) as [TransactionType, ...TransactionType[]];

export const baseTransactionSchema = z.object({
  amount: z
    .number({ message: "Amount must be a number" })
    .positive("Amount must be greater than 0")
    .max(1000000, "Amount cannot exceed €1,000,000")
    .transform((val) => Math.round(val * 100) / 100),

  type: z.enum(TRANSACTION_TYPES, {
    message: "Please select a valid transaction type",
  }),

  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .transform((val) => val?.trim() || undefined),

  transactionDate: z
    .date({ message: "Transaction date is required" })
    .refine((date) => date <= new Date(), "Transaction date cannot be in the future"),

  isRecurring: z.boolean().default(false),

  propertyId: z
    .string()
    .min(1, "Property is required")
    .uuid("Invalid property ID"),

  categoryId: z
    .string()
    .min(1, "Category is required")
    .uuid("Invalid category ID"),
});

export const transactionFormSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a valid number greater than 0",
    })
    .refine((val) => parseFloat(val) <= 1000000, {
      message: "Amount cannot exceed €1,000,000",
    }),

  type: z.enum(TRANSACTION_TYPES, {
    message: "Please select a valid transaction type",
  }),

  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),

  transactionDate: z
    .string()
    .min(1, "Transaction date is required")
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, "Please provide a valid date")
    .refine((val) => {
      const date = new Date(val);
      return date <= new Date();
    }, "Transaction date cannot be in the future"),

  propertyId: z
    .string()
    .min(1, "Property is required")
    .uuid("Invalid property ID"),

  categoryId: z
    .string()
    .min(1, "Category is required")
    .uuid("Invalid category ID"),
});

export const createTransactionSchema = baseTransactionSchema;

export const updateTransactionSchema = baseTransactionSchema.extend({
  id: z.uuid("Invalid transaction ID"),
});

export const transactionQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : 1)
    .refine((val) => val > 0, "Page must be greater than 0"),

  limit: z
    .string()
    .optional()
    .transform((val) => val ? Math.min(100, Math.max(10, parseInt(val, 10))) : 25)
    .refine((val) => val >= 10 && val <= 100, "Limit must be between 10 and 100"),

  dateFrom: z
    .string()
    .optional()
    .transform((val) => val ? new Date(val) : undefined)
    .refine((val) => !val || !isNaN(val.getTime()), "Invalid from date"),

  dateTo: z
    .string()
    .optional()
    .transform((val) => val ? new Date(val) : undefined)
    .refine((val) => !val || !isNaN(val.getTime()), "Invalid to date"),

  type: z
    .enum([...TRANSACTION_TYPES, "all"] as const)
    .optional()
    .transform((val) => val === "all" ? undefined : val),

  amountMin: z
    .string()
    .optional()
    .transform((val) => val ? parseFloat(val) : undefined)
    .refine((val) => !val || (!isNaN(val) && val >= 0), "Minimum amount must be a positive number"),

  amountMax: z
    .string()
    .optional()
    .transform((val) => val ? parseFloat(val) : undefined)
    .refine((val) => !val || (!isNaN(val) && val >= 0), "Maximum amount must be a positive number"),

  categoryIds: z
    .string()
    .optional()
    .transform((val) => val ? val.split(",").filter(Boolean) : undefined),

  isRecurring: z
    .string()
    .optional()
    .transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    }),

  propertyId: z.uuid("Invalid property ID").optional(),

  search: z.string().trim().optional(),

  sortBy: z
    .enum(["transactionDate", "amount", "type", "category"])
    .default("transactionDate"),

  sortOrder: z.enum(["asc", "desc"]).default("desc"),
}).refine(
  (data) => {
    if (data.amountMin !== undefined && data.amountMax !== undefined) {
      return data.amountMin <= data.amountMax;
    }
    return true;
  },
  {
    message: "Minimum amount cannot be greater than maximum amount",
    path: ["amountMin"],
  }
).refine(
  (data) => {
    if (data.dateFrom && data.dateTo) {
      return data.dateFrom <= data.dateTo;
    }
    return true;
  },
  {
    message: "From date cannot be after to date",
    path: ["dateFrom"],
  }
);

export const transactionResponseSchema = z.object({
  transaction: z.object({
    id: z.uuid(),
    amount: z.number(),
    type: z.enum(TRANSACTION_TYPES),
    description: z.string().optional(),
    transactionDate: z.date(),
    isRecurring: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
    userId: z.uuid(),
    propertyId: z.uuid(),
    categoryId: z.uuid(),
    category: z.object({
      id: z.string().uuid(),
      name: z.string(),
      type: z.enum(TRANSACTION_TYPES),
      description: z.string().optional(),
    }).optional(),
    property: z.object({
      id: z.uuid(),
      name: z.string(),
      address: z.string(),
    }).optional(),
  }),
  message: z.string(),
});

export const transactionListResponseSchema = z.object({
  transactions: z.array(transactionResponseSchema.shape.transaction),
  totalCount: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
  pageSize: z.number(),
});

export const transactionStatsResponseSchema = z.object({
  totalIncome: z.number(),
  totalExpenses: z.number(),
  cashFlow: z.number(),
  transactionCount: z.number(),
});

export const errorResponseSchema = z.object({
  error: z.string(),
  details: z.record(z.string(), z.array(z.string())).optional(),
});

// Raw form input type (before validation/transformation)
export type TransactionFormInput = z.input<typeof transactionFormSchema>;

// Processed form output type (after manual transformation for API)
export type TransactionFormOutput = {
  amount: number;
  type: TransactionType;
  description?: string;
  transactionDate: Date;
  isRecurring: boolean;
  propertyId: string;
  categoryId: string;
};

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionQueryInput = z.input<typeof transactionQuerySchema>;
export type TransactionResponse = z.infer<typeof transactionResponseSchema>;
export type TransactionListResponse = z.infer<typeof transactionListResponseSchema>;
export type TransactionStatsResponse = z.infer<typeof transactionStatsResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;