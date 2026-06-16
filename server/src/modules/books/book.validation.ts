import { z } from "zod";

export const createBookSchema = z.object({
  body: z.object({
    book_name: z
      .string()
      .min(2, "Book name must contain at least 2 characters"),

    book_author: z
      .string()
      .min(2, "Author name must contain at least 2 characters"),

    category_id: z.uuid("Invalid classification identifier formatting"),

    total_copies: z.coerce
      .number()
      .min(1, "Total copies must be at least 1"),

    // 🌟 FIXED TYPO HERE (langauge -> language)
    language: z.string().min(2, "Language name must contain at least 2 characters")
  }),
});

export const updateBookSchema = z.object({
  body: z.object({
    book_name: z.string().optional(),
    book_author: z.string().optional(),
    category_id: z.uuid().optional(),
    total_copies: z.coerce.number().optional(),
    available_copies: z.coerce.number().optional(),
    // 🌟 FIXED TYPO HERE (langauge -> language)
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

// 🌟 FIXED: Added language validation rules to your Ledger List validation definitions!
export const getBooksQueryValidation = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).default(10),
    search: z.string().optional(),
    category_id: z.string().uuid().optional().or(z.literal("")),
    language: z.string().optional(), // 🌟 ALLOW LANGUAGE FILTERS THROUGH QUERY VALIDATION
  }),
});