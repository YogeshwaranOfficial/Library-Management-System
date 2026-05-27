import { z } from "zod";

export const createBookSchema = z.object({
  body: z.object({
    book_name: z
      .string()
      .min(2, "Book name must contain at least 2 characters"),

    book_author: z
      .string()
      .min(2, "Author name must contain at least 2 characters"),

    category_id: z.uuid(),

    total_copies: z
      .number()
      .min(1, "Total copies must be at least 1"),
  }),
});

export const updateBookSchema = z.object({
  body: z.object({
    book_name: z.string().optional(),

    book_author: z.string().optional(),

    category_id: z.uuid().optional(),

    total_copies: z.number().optional(),

    available_copies: z.number().optional(),
  }),
});