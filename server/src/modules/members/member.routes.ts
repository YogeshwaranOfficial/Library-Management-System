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

import {
  createMemberController,
  deleteMemberController,
  getAllMembersController,
  getMemberByIdController,
  updateMemberController,
} from "./member.controller.js";

import {
  createMemberValidation,
  updateMemberValidation,
  getMembersQueryValidation
} from "./member.validation.js";

const router = Router();

router.post(
  "/",
  auth,
  validate(createMemberValidation),
  createMemberController
);


router.get(
  "/:id",
  auth,
  getMemberByIdController
);

router.patch(
  "/:id",
  auth,
  validate(updateMemberValidation),
  updateMemberController
);

router.delete(
  "/:id",
  auth,
  deleteMemberController
);

router.get(
  "/",
  auth,
  validate(getMembersQueryValidation),
  getAllMembersController
);

export default router;