/**
 * @swagger
 * tags:
 *   name: Members
 *   description: Library member management APIs
 */

/**
 * @swagger
 * /members:
 *   get:
 *     summary: Get all members
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         example: "john"
 *
 *       - in: query
 *         name: plan
 *         schema:
 *           type: string
 *         example: "premium"
 *
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         example: "ACTIVE"
 *
 *       - in: query
 *         name: membership_status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, EXPIRED, CLOSED]
 *
 *     responses:
 *       200:
 *         description: Members fetched successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /members:
 *   post:
 *     summary: Create new member
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *
 *             required:
 *               - user_id
 *               - membership_plan_id
 *
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *                 example: a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d
 *
 *               membership_plan_id:
 *                 type: string
 *                 format: uuid
 *                 example: f8g9h0i1-j2k3-4l5m-6n7o-8p9q0r1s2t3u
 *
 *     responses:
 *       201:
 *         description: Member created successfully
 *       409:
 *         description: User already registered as member
 *       404:
 *         description: Membership plan not found
 */

/**
 * @swagger
 * /members/{id}:
 *   get:
 *     summary: Get member by ID
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: Member fetched successfully
 *       404:
 *         description: Member not found
 */

/**
 * @swagger
 * /members/{id}:
 *   patch:
 *     summary: Update member
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               membership_plan_id:
 *                 type: string
 *                 format: uuid
 *               membership_status:
 *                 type: string
 *                 enum: [ACTIVE, EXPIRED, CLOSED]
 *               is_active:
 *                 type: boolean
 *
 *     responses:
 *       200:
 *         description: Member updated successfully
 *       404:
 *         description: Member not found
 */

/**
 * @swagger
 * /members/{id}:
 *   delete:
 *     summary: Delete member
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: Member deleted successfully
 *       404:
 *         description: Member not found
 */

/**
 * @swagger
 * /members/search:
 *   get:
 *     summary: Search members by name
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         example: "john"
 *
 *     responses:
 *       200:
 *         description: Search results returned successfully
 */

/**
 * @swagger
 * /members/available-users:
 *   get:
 *     summary: Get eligible users for membership creation
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Eligible users fetched successfully
 */

/**
 * @swagger
 * /members/plans:
 *   get:
 *     summary: Get all membership plans
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Membership plans fetched successfully
 */

import { Router, Request, Response } from "express";
import auth from "../../middlewares/auth.js";
import validate from "../../middlewares/validate.js";
import MembershipPlan from "../../database/models/MembershipPlan.js";

import {
  createMemberController,
  deleteMemberController,
  getAllMembersController,
  getMemberByIdController,
  updateMemberController,
  getAvailableUsersController,
  searchMembersByNameController,
  getAllPlansWithMetricsController // 💡 ADDED: Imported the plans dashboard controller
} from "./member.controller.js";

import {
  createMemberValidation,
  updateMemberValidation,
  getMembersQueryValidation,
  searchMembersQueryValidation,
  getPlansQueryValidation,
  getMemberByIdParamsValidation
} from "./member.validation.js";

const router = Router();

// 1. Fetch readers eligible for a new profile
router.get(
  "/available-users",
  auth,
  getAvailableUsersController
);

/**
 * @route   GET /api/plans/dropdown
 * @desc    Fetch all available membership plans for UI dropdown selections
 * @access  Public / Protected (Depending on your middleware)
 */router.get("/dropdown", async (req: Request, res: Response): Promise<any> => {
  try {
    // 1. Fetching from database
    const plans = await MembershipPlan.findAll({
      order: [["plan_name", "ASC"]],
    });

    // 2. Sending successful response
    return res.status(200).json({
      success: true,
      message: "Membership plans retrieved successfully.",
      data: plans,
    });
  } catch (error) {
    // 🌟 Look at your terminal console running the server to see the exact database error!
    console.error("====== DROPDOWN CRASH LOG ======", error);
    
    return res.status(500).json({
      success: false,
      message: "Internal server error while syncing data ledger sequences.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// 2. Lookup active membership plan structures with dashboard aggregation metrics
router.get(
  "/plans", 
  auth, 
  validate(getPlansQueryValidation), // 💡 ADDED: Validates query parameters securely
  getAllPlansWithMetricsController   // 💡 ADDED: Routes payload logic down the architecture pipeline
);



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
  validate(getMemberByIdParamsValidation),
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