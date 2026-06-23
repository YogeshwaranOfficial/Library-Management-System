import { z } from "zod";

// Professional regular expressions
const NAME_REGEX = /^[a-zA-Z\s]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ message: "Name is required" }) 
      .trim()
      .min(3, "Name must contain at least 3 characters")
      .max(50, "Name cannot exceed 50 characters")
      .regex(NAME_REGEX, "Name can only contain alphabets and spaces"),

    gmail: z
      .string({ message: "Email is required" }) // Fixed here
      .trim()
      .toLowerCase()
      .email("Invalid email address formatting")
      .endsWith("@gmail.com", "Only Gmail addresses are allowed at this time"),

    password: z
      .string({ message: "Password is required" }) 
      .min(8, "Password must be at least 8 characters long")
      .max(100, "Password is too long")
      .regex(
        PASSWORD_REGEX,
        "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),

    phoneNumber: z
      .string()
      .trim()
      .regex(PHONE_REGEX, "Invalid phone number format (Use E.164 format, e.g., +1234567890)")
      .optional()
      .or(z.literal("")),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    gmail: z
      .string({ message: "Email is required" }) 
      .trim()
      .toLowerCase()
      .email("Invalid email address"),

    password: z
      .string({ message: "Password is required" }), 
  }),
});