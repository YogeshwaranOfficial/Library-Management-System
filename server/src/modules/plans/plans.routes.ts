/**
 * @swagger
 * tags:
 *   name: Plans
 *   description: Membership plan management APIs
 */

/**
 * @swagger
 * /plans:
 *   get:
 *     summary: Get all membership plans
 *     description: Fetch all available membership plans configured in the library system.
 *     tags: [Plans]
 *
 *     responses:
 *       200:
 *         description: Membership plans fetched successfully
 *
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /plans/create:
 *   post:
 *     summary: Create a new membership plan
 *     description: Create a new subscription plan for library members.
 *     tags: [Plans]
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plan_name
 *               - price
 *               - duration_days
 *               - max_books_allowed
 *
 *             properties:
 *               plan_name:
 *                 type: string
 *                 example: Premium Plan
 *
 *               price:
 *                 type: number
 *                 example: 499
 *
 *               duration_days:
 *                 type: integer
 *                 example: 30
 *
 *               max_books_allowed:
 *                 type: integer
 *                 example: 5
 *
 *     responses:
 *       201:
 *         description: Membership plan created successfully
 *
 *       409:
 *         description: Plan name already exists
 *
 *       422:
 *         description: Validation error
 */

/**
 * @swagger
 * /plans/edit:
 *   patch:
 *     summary: Update an existing membership plan
 *     description: Modify plan name, price, duration, or borrowing limits.
 *     tags: [Plans]
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *
 *             required:
 *               - membership_plan_id
 *               - plan_name
 *               - price
 *               - duration_days
 *               - max_books_allowed
 *
 *             properties:
 *               membership_plan_id:
 *                 type: string
 *                 format: uuid
 *                 example: a1b2c3d4-e5f6-7890-ab12-cd34ef56gh78
 *
 *               plan_name:
 *                 type: string
 *                 example: Premium Plus
 *
 *               price:
 *                 type: number
 *                 example: 799
 *
 *               duration_days:
 *                 type: integer
 *                 example: 90
 *
 *               max_books_allowed:
 *                 type: integer
 *                 example: 10
 *
 *     responses:
 *       200:
 *         description: Membership plan updated successfully
 *
 *       404:
 *         description: Plan not found
 *
 *       409:
 *         description: Plan name conflict
 *
 *       422:
 *         description: Validation error
 */

/**
 * @swagger
 * /plans/delete:
 *   delete:
 *     summary: Delete a membership plan
 *     description: Permanently remove a membership plan from the system.
 *     tags: [Plans]
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *
 *             required:
 *               - membership_plan_id
 *
 *             properties:
 *               membership_plan_id:
 *                 type: string
 *                 format: uuid
 *                 example: a1b2c3d4-e5f6-7890-ab12-cd34ef56gh78
 *
 *     responses:
 *       200:
 *         description: Membership plan deleted successfully
 *
 *       404:
 *         description: Plan not found
 *
 *       400:
 *         description: Plan cannot be deleted due to dependency constraints
 */

import { Router } from "express";
import validate from "../../middlewares/validate.js";
import { PlansController } from "./plans.controller.js";
import { createPlanValidation, updatePlanValidation, deletePlanValidation } from "./plans.validation.js";

const router = Router();
const controller = new PlansController();

// /plan context target loop binds
router.get("/", controller.getPlans);
router.post("/create", validate(createPlanValidation), controller.createPlan);
router.patch("/edit", validate(updatePlanValidation), controller.editPlan);
router.delete("/delete", validate(deletePlanValidation), controller.deletePlan);

export default router;