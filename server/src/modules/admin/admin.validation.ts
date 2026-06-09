import { z } from "zod";

// ==========================================
// 1. SHARED BASE PATTERNS
// ==========================================
const nameSchema = z
  .string({ error: "Full name is required." }) // 💡 Fixed: Changed to error object format
  .trim()
  .min(1, { message: "Name parameter cannot be left blank." });

const gmailSchema = z
  .string({ error: "Gmail address handle is required." }) // 💡 Fixed: Changed to error object format
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9](\.?[a-z0-9]){4,29}@gmail\.com$/, {
    message: "Value must register a valid structural @gmail.com electronic layout.",
  });

const passwordSchema = z
  .string({ error: "Security credential string is required." }) // 💡 Fixed: Changed to error object format
  .min(8, { message: "Security value must be a minimum of 8 characters long." })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W_]{8,}$/, {
    message: "Security key must contain an uppercase letter, lowercase letter, and a numeric value.",
  });

const phoneSchema = z
  .string({ error: "Phone connectivity baseline mapping is required." }) // 💡 Fixed: Changed to error object format
  .trim()
  .regex(/^\d{10}$/, { message: "Phone profile must be an absolute 10-digit numeric line string." });


// ==========================================
// 2. EXPORTED MIDDLEWARE SCHEMAS
// ==========================================

// POST /admin/add-user
export const addUserValidation = z.object({
  body: z.object({
    name: nameSchema,
    gmail: gmailSchema,
    password: passwordSchema,
    phone_number: phoneSchema,
    // 💡 FIXED: Enforced your specific error mapping format directly onto the enum declaration
    role: z.enum(["READER", "LIBRARIAN"], {
      error: "Role value allocation must be READER or LIBRARIAN.",
    }).default("READER"),
  }),
});

// PATCH /admin/user/:user_id
export const updateUserValidation = z.object({
  params: z.object({
    user_id: z.string().uuid({ message: "Invalid user ID URL route key format." }),
  }),
  body: z.object({
    name: nameSchema.optional(),
    gmail: gmailSchema.optional(),
    password: passwordSchema.optional(),
    phone_number: phoneSchema.optional(),
  }).strict(),
});

// DELETE /admin/user/:user_id
export const deleteUserValidation = z.object({
  params: z.object({
    user_id: z.string().uuid({ message: "Invalid user ID URL route key format." }),
  }),
});