import { z } from "zod";

export const TransactionFormSchema = z.object({
  memberId: z.string().min(1, { message: "Please link an active member profile" }),
  bookId: z.string().min(1, { message: "Please specify an available media title" }),
  borrowedDate: z.string().min(1, { message: "Borrow date reference is required" }),
  dueDate: z.string().min(1, { message: "Please set a valid return deadline date" }),
  status: z.enum(["BORROWED", "RETURNED", "OVERDUE"]),
});

export type TransactionFormValues = z.infer<typeof TransactionFormSchema>;