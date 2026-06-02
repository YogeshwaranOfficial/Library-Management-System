import { z } from "zod";

export const MemberFormSchema = z.object({
  userId: z.string().min(1, { message: "Please select an available user account reference" }),
  email: z.string().email(),
  phoneNumber: z.string().min(1, { message: "Phone number is required" }),
  membershipPlanId: z.string().min(1, { message: "Please allocate an operational membership plan tier" }),
  isActive: z.boolean(),
});

export type MemberFormValues = z.infer<typeof MemberFormSchema>;