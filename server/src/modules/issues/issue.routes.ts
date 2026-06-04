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
  getAllIssuesFeedController,
  getMemberAllowanceMetricsController, // Processes load metric counts
  updateIssueParametersController
} from "./issue.controller.js";

import {
  createIssueSchema,
  updateIssueSchema,
  getMemberAllowanceSchema,
  returnBookSchema,
  getMemberIssuesSchema, 
} from "./issue.validation.js";

const router = Router();

// 1. Master Ledger Feed Logs
router.get("/", auth, getAllIssuesFeedController);

// 2. Used by TransactionModal.tsx (Allocation Limits check)
router.get(
  "/member-allowance/:memberId",
  auth,
  validate(getMemberAllowanceSchema),
  getMemberAllowanceMetricsController
);

// 3. ✨ ADDED: Used by IssueDetailsModal.tsx (Stats counter summary popups)
// Maps directly to the same controller to pass back active limits & safe history references!
router.get(
  "/member-stats/:memberId",
  auth,
  validate(getMemberAllowanceSchema),
  getMemberAllowanceMetricsController
);

// 4. Issue a Book Voucher
router.post("/borrow", auth, validate(createIssueSchema), borrowBookController);

// 5. Modify Active Parameters
router.put("/:id", auth, validate(updateIssueSchema), updateIssueParametersController);

// 6. Close/Process Active Asset Return
router.post("/return", auth, validate(returnBookSchema), returnBookController);

// 7. Historical Ledger logs for individual Member
router.get("/member/:memberId", auth, validate(getMemberIssuesSchema), getMemberIssuesController);

router.get("/overdue", auth);

export default router;