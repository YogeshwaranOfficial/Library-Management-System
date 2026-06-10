import { z } from "zod";

// ==========================================
// 1. SHARED BASE PATTERNS
// ==========================================
const nameSchema = z
  .string({ error: "Full name is required." }) 
  .trim()
  .min(1, { message: "Name parameter cannot be left blank." });

const gmailSchema = z
  .string({ error: "Gmail address handle is required." }) 
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9](\.?[a-z0-9]){4,29}@gmail\.com$/, {
    message: "Value must register a valid structural @gmail.com electronic layout.",
  });

const passwordSchema = z
  .string({ error: "Security credential string is required." }) 
  .min(8, { message: "Security value must be a minimum of 8 characters long." })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W_]{8,}$/, {
    message: "Security key must contain an uppercase letter, lowercase letter, and a numeric value.",
  });

const phoneSchema = z
  .string({ error: "Phone connectivity baseline mapping is required." }) 
  .trim()
  .regex(/^\d{10}$/, { message: "Phone profile must be an absolute 10-digit numeric line string." });


// ==========================================
// 2. EXPORTED MIDDLEWARE SCHEMAS (READERS)
// ==========================================

// POST /admin/add-user
export const addUserValidation = z.object({
  body: z.object({
    name: nameSchema,
    gmail: gmailSchema,
    password: passwordSchema,
    phone_number: phoneSchema,
    // 💡 FIXED: Uses standard object parameter mapping configuration correctly
    role: z.enum(["READER", "LIBRARIAN"], {
      message: "Role value allocation must be READER or LIBRARIAN.",
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


// ==========================================
// 💡 3. EXPORTED MIDDLEWARE SCHEMAS (LIBRARIANS)
// ==========================================

// POST /admin/add-librarian
export const addLibrarianValidation = z.object({
  body: z.object({
    name: nameSchema,
    gmail: gmailSchema,
    password: passwordSchema,
    phone_number: phoneSchema,
    role: z.enum(["LIBRARIAN"]).default("LIBRARIAN"), // Force-locks the scope constraint 
  }),
});

// PATCH /admin/librarian/:user_id
export const updateLibrarianValidation = z.object({
  params: z.object({
    user_id: z.string().uuid({ message: "Invalid librarian ID URL route key format." }),
  }),
  body: z.object({
    name: nameSchema.optional(),
    gmail: gmailSchema.optional(),
    password: passwordSchema.optional(), // Remains optional so edits don't overwrite existing passwords
    phone_number: phoneSchema.optional(),
  }).strict(),
});

// DELETE /admin/librarian/:user_id
export const deleteLibrarianValidation = z.object({
  params: z.object({
    user_id: z.string().uuid({ message: "Invalid librarian ID URL route key format." }),
  }),
});