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

    // 💡 FIX: Coerce strings to actual numbers to handle native form values smoothly
    total_copies: z.coerce
      .number()
      .min(1, "Total copies must be at least 1"),
  }),
});

export const updateBookSchema = z.object({
  body: z.object({
    book_name: z.string().optional(),
    book_author: z.string().optional(),
    category_id: z.uuid().optional(),
    // 💡 FIX: Coerce numbers here as well for updates
    total_copies: z.coerce.number().optional(),
    available_copies: z.coerce.number().optional(),
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

// 🌟 NEW: Clean Validation Framework for your main ledger list dashboard parameters!
// Validates parameters for: GET /api/v1/books?page=1&limit=10&search=Rich&category_id=...
export const getBooksQueryValidation = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).default(10),
    search: z.string().optional(),
    category_id: z.string().uuid().optional().or(z.literal("")),
  }),
});