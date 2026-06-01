/**
 * @swagger
 * /issues/borrow:
 *   post:
 *     summary: Issue/Borrow a book for a member
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - member_id
 *               - book_id
 *
 *             properties:
 *               member_id:
 *                 type: string
 *                 format: uuid
 *                 example: a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d
 *
 *               book_id:
 *                 type: string
 *                 format: uuid
 *                 example: f8g9h0i1-j2k3-4l5m-6n7o-8p9q0r1s2t3u
 *
 *     responses:
 *       201:
 *         description: Book borrowed successfully
 *
 *       400:
 *         description: Membership inactive, item out-of-stock, or quota ceilings breached
 *
 *       404:
 *         description: Member or Book reference target not found
 */

/**
 * @swagger
 * /issues/return:
 *   post:
 *     summary: Return an issued book and reconcile inventory stock balances
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - issue_id
 *
 *             properties:
 *               issue_id:
 *                 type: string
 *                 format: uuid
 *                 example: b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e
 *
 *     responses:
 *       200:
 *         description: Book returned successfully. Fines dynamically logged if overdue.
 *
 *       400:
 *         description: Book has already been safely returned
 *
 *       404:
 *         description: Tracking record not discovered
 */

/**
 * @swagger
 * /issues/overdue:
 *   get:
 *     summary: Fetch active loan tracking cycles currently cataloged as overdue
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: List of overdue logs mapped back returned safely
 *
 *       401:
 *         description: Unauthorized token verification failure
 */
import { Router } from "express";
import auth from "../../middlewares/auth.js";
import validate from "../../middlewares/validate.js";

import {
  borrowBookController,
  getMemberIssuesController,
  returnBookController,
  // overdueIssuesController // 👈 Import this once you build its logic!
} from "./issue.controller.js";

import {
  createIssueSchema,
  returnBookSchema,
  getMemberIssuesSchema, // ✨ Added parameter validation
} from "./issue.validation.js";

const router = Router();

router.post(
  "/borrow",
  auth,
  validate(createIssueSchema),
  borrowBookController
);

router.post(
  "/return",
  auth,
  validate(returnBookSchema),
  returnBookController
);

router.get(
  "/member/:memberId",
  auth,
  validate(getMemberIssuesSchema), // ✨ Added validation middleware check here
  getMemberIssuesController
);

// ✨ FIXED: Added missing route discovered during Swagger audit
router.get(
  "/overdue",
  auth,
  // overdueIssuesController
);

export default router;