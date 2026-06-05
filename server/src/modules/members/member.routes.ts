/**
 * @swagger
 * /members:
 *   get:
 *     summary: Get all members
 *     tags: [Members]
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Members fetched successfully
 */


/**
 * @swagger
 * /members:
 *   post:
 *     summary: Create new member
 *     tags: [Members]
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *
 *             required:
 *               - user_id
 *               - membership_plan_id
 *               - start_date
 *               - expiry_date
 *
 *             properties:
 *               user_id:
 *                 type: string
 *
 *               membership_plan_id:
 *                 type: string
 *
 *               start_date:
 *                 type: string
 *
 *               expiry_date:
 *                 type: string
 *
 *     responses:
 *       201:
 *         description: Member created successfully
 */


import { Router } from "express";

import auth from "../../middlewares/auth.js";
import validate from "../../middlewares/validate.js";
import MembershipPlan from "../../database/models/MembershipPlan.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { Request, Response } from "express";

import {
  createMemberController,
  deleteMemberController,
  getAllMembersController,
  getMemberByIdController,
  updateMemberController,
  getAvailableUsersController,
  searchMembersByNameController // ✨ NEW: Import the search controller
} from "./member.controller.js";

import {
  createMemberValidation,
  updateMemberValidation,
  getMembersQueryValidation,
  searchMembersQueryValidation
} from "./member.validation.js";

const router = Router();

// 1. Fetch readers eligible for a new profile
router.get(
  "/available-users",
  auth,
  getAvailableUsersController
);

// 2. Lookup active membership plan structures
router.get("/plans", auth, asyncHandler(async (req: Request, res: Response) => {
  const plans = await MembershipPlan.findAll();
  res.status(200).json({
    success: true,
    data: plans
  });
}));

// ⭐ NEW: Search directory matching frontend type-ahead bars
// 🛡️ CRITICAL PLACEMENT: Located ABOVE /:id to prevent UUID type-casting crashes!
router.get(
  "/search",
  auth,
  validate(searchMembersQueryValidation),
  searchMembersByNameController
);

// 3. Main directory management feed grid data
router.get(
  "/",
  auth,
  validate(getMembersQueryValidation),
  getAllMembersController
);

// 4. Create a brand new record profile mapping
router.post(
  "/",
  auth,
  validate(createMemberValidation),
  createMemberController
);

// 5. Get deep record attributes by primary key
router.get(
  "/:id",
  auth,
  getMemberByIdController
);

// 6. Update parameters on an existing profile
router.patch(
  "/:id",
  auth,
  validate(updateMemberValidation),
  updateMemberController
);

// 7. Remove profile references completely
router.delete(
  "/:id",
  auth,
  deleteMemberController
);

export default router;