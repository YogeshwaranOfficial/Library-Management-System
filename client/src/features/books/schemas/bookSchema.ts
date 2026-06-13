import { z } from "zod";

export const BookFormSchema = z.object({
  title: z.string().min(1, { message: "Book title identifier line is required" }),
  author: z.string().min(1, { message: "Author source reference name is required" }),
  totalCopies: z.number()
    .int({ message: "Stock counts must be whole integers" })
    .min(1, { message: "Minimum catalog collection entry requires 1 copy" }),
  categoryId: z.string().min(1, { message: "Please map this asset to an organizational category" }),
  language: z.string().min(1, { message: "language is required" }),
});

export type BookFormValues = z.infer<typeof BookFormSchema>;