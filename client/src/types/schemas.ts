import { z } from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email field cannot be empty" })
    .regex(emailRegex,{
      message: "Use the valid email format sample@gmail.com"
    }),
  password: z
    .string()
    .min(8, { message: "Security standard requires at least 8 characters" })
    .regex(passwordRegex, {
      message: "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.",
    }),
    role: z.enum(["ADMIN", "LIBRARIAN"], {
    error: "Please select an operational access profile",
  }),
});

export type LoginCredentials = z.infer<typeof LoginSchema>;

export interface UserSession {
  id: string;
  email: string;
  role: "ADMIN" | "LIBRARIAN";
}