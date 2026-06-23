import { z } from "zod";

// 🚀 REUSABLE VALIDATION LOGIC ENGINE FOR THE ISBN FORMAT STRINGS
const isbnRegexValidator = z
  .string()
  .min(1, "ISBN number is required")
  .regex(
      /^(?:ISBN(?:-1[03])?:?\s*)?(?:(?=^[0-9X]{10}$)|(?=^[0-9-]{13}$)|(?=^[0-9X]{13}$))?(?:97[89]-?)?[0-9]{1,5}-?[0-9]+-?[0-9]+-?[0-9X]$/i,
    "Please provide a valid ISBN-10 or ISBN-13 barcode sequence format"
  );

export const createBookSchema = z.object({
  body: z.object({
    book_name: z
      .string()
      .min(2, "Book name must contain at least 2 characters"),

    book_author: z
      .string()
      .min(2, "Author name must contain at least 2 characters"),

    // 🚀 NEW: Required Mandatory ISBN field contract assignment
    isbn: isbnRegexValidator,

    category_id: z.uuid("Invalid classification identifier formatting"),

    total_copies: z.coerce
      .number()
      .min(1, "Total copies must be at least 1"),

    language: z.string().min(2, "Language name must contain at least 2 characters")
  }),
});

export const updateBookSchema = z.object({
  body: z.object({
    book_name: z.string().optional(),
    book_author: z.string().optional(),
    // 🚀 NEW: Optional on record update mutations
    isbn: isbnRegexValidator.optional(),
    category_id: z.uuid().optional(),
    total_copies: z.coerce.number().optional(),
    available_copies: z.coerce.number().optional(),
    language: z.string().optional()
  }),
});

// Handles rules for specialized standalone lookup channels: GET /api/v1/books/search?q=...
export const searchBooksQueryValidation = z.object({
  query: z.object({
    q: z
      .string({ error: "Search parameter 'q' is required for looking up items." })
      .min(1, { message: "Search string must contain at least 1 character." }),
  }),
});

// 🌟 UPDATED: Added sorting validation rules to keep query validation in sync
export const getBooksQueryValidation = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).default(10),
    search: z.string().optional().or(z.literal("")),
    
    // Safely handles when a filter drops back to an empty string on clear
    category_id: z.string().uuid().optional().or(z.literal("")),
    language: z.string().optional().or(z.literal("")), 

    // 🚀 NEW: Appended "isbn" to whitelist array properties
    sort_by: z
      .enum(["book_name", "created_at", "language", "total_copies", "available_copies", "isbn"])
      .optional()
      .default("created_at"),
      
    order: z
      .enum(["ASC", "DESC", "asc", "desc"])
      .optional()
      .default("DESC"),
  }),
});