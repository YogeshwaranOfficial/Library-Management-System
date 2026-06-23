import { z } from "zod";

// 1. Core Object Body Framework (Maps directly to your Sequelize limits)
const planBodySchema = z.object({
  plan_name: z
    .string({ error: "Plan profile alias name is mandatory." })
    .trim()
    .min(1, { message: "Plan name cannot be an empty string." })
    .max(50, { message: "Plan name cannot exceed 50 character limits." }),

  price: z
    .number({ error: "Financial price rate metric is mandatory." })
    .min(0, { message: "Financial rate metric cannot represent negative numbers." }),

  duration_days: z
    .number({ error: "Duration scope matrix is mandatory." })
    .int({ message: "Duration framework must be a whole integer number." })
    .min(1, { message: "Duration framework must match at least 1 calendar day timeline." }),

  max_books_allowed: z
    .number({ error: "Maximum resource book limit assignment is mandatory." })
    .int({ message: "Resource volume metric must be a whole integer number." })
    .min(1, { message: "Resource allocation volume metric must be greater than zero." }),
});

// 2. Export Wrapped Middleware Schemas (Matching your custom runner configuration)
export const createPlanValidation = z.object({
  body: planBodySchema
});

// 3. Update Mutation Validation Schema
export const updatePlanValidation = z.object({
  body: planBodySchema.extend({
    membership_plan_id: z
      .string({ error: "Target operational plan context identifier is missing." })
      .uuid({ message: "Invalid membership plan ID UUID format." }),
  }).strict(), // Guarantees no stray properties breach the update array payload loop
});

// 4. Delete Record Action Validation Schema
export const deletePlanValidation = z.object({
  body: z.object({
    membership_plan_id: z
      .string({ error: "Target operational delete target reference context id is missing." })
      .uuid({ message: "Invalid membership plan ID UUID format." }),
  }).strict(),
});