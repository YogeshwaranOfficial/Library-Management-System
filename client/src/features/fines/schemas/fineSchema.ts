import { z } from "zod";

export const FineFormSchema = z.object({
  paidStatus: z.boolean(),
  paidDate: z.string().nullable(),
});

export type FineFormValues = z.infer<typeof FineFormSchema>;