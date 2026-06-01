import { z } from "zod";

export const payFineSchema = z.object({
  body: z.object({
    fine_id: z.string().uuid("Invalid fine identifier format"),
  }),
});