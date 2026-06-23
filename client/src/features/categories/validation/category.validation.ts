import { z } from "zod";

export const categoryFormSchema = (existingNames: string[]) => 
  z.object({
    categoryName: z
      .string()
      .min(1, "Category name cannot be empty")
      .regex(/^[A-Za-z\s]+$/, "Category name must only contain alphabet letters and spaces")
      .refine(
        (val) => !existingNames.map(n => n.toLowerCase()).includes(val.trim().toLowerCase()),
        { message: "This category already exists in the library system" }
      ),
  });

export type CategoryFormValues = {
  categoryName: string;
};