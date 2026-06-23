/**
 * @swagger
 * tags:
 *   name: Issues
 *   description: Book circulation (borrow / return / tracking) APIs
 */

/* =========================================================
   📚 BORROW BOOK
========================================================= */
/**
 * @swagger
 * /issues/borrow:
 *   post:
 *     summary: Issue/Borrow a book for a member
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - memberId
 *               - bookId
 *               - dueDate
 *             properties:
 *               memberId:
 *                 type: string
 *                 format: uuid
 *               bookId:
 *                 type: string
 *                 format: uuid
 *               borrowDate:
 *                 type: string
 *                 format: date
 *               dueDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Book borrowed successfully
 *       400:
 *         description: Borrow limit reached / book unavailable / invalid request
 *       404:
 *         description: Member or Book not found
 */


/* =========================================================
   📦 RETURN BOOK
========================================================= */
/**
 * @swagger
 * /issues/return:
 *   post:
 *     summary: Return a borrowed book
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - issueId
 *             properties:
 *               issueId:
 *                 type: string
 *                 format: uuid
 *               returnedDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Book returned successfully
 *       400:
 *         description: Book already returned
 *       403:
 *         description: Fine pending or return blocked
 *       404:
 *         description: Issue not found
 */


/* =========================================================
   ⚠️ OVERDUE ISSUES
========================================================= */
/**
 * @swagger
 * /issues/overdue:
 *   get:
 *     summary: Fetch all overdue borrowed books
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overdue issues fetched successfully
 *       401:
 *         description: Unauthorized
 */


/* =========================================================
   📊 ALL ISSUES FEED
========================================================= */
/**
 * @swagger
 * /issues:
 *   get:
 *     summary: Get full circulation feed (borrowed, returned, overdue)
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Issues feed retrieved successfully
 */


/* =========================================================
   👤 MEMBER ALLOWANCE
========================================================= */
/**
 * @swagger
 * /issues/member-allowance/{memberId}:
 *   get:
 *     summary: Get member borrow limit and active issue count
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Member allowance fetched successfully
 */


/* =========================================================
   👤 MEMBER ISSUE HISTORY
========================================================= */
/**
 * @swagger
 * /issues/member/{memberId}:
 *   get:
 *     summary: Get all issues for a specific member
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Member issue history fetched successfully
 */


/* =========================================================
   ✏️ UPDATE ISSUE
========================================================= */
/**
 * @swagger
 * /issues/{id}:
 *   patch:
 *     summary: Update issue record (borrow, due date, restore)
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               memberId:
 *                 type: string
 *                 format: uuid
 *               bookId:
 *                 type: string
 *                 format: uuid
 *               borrowDate:
 *                 type: string
 *                 format: date
 *               dueDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [BORROWED, RETURNED, OVERDUE]
 *               returnedDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Issue updated successfully
 *       404:
 *         description: Issue not found
 */


/* =========================================================
   ❌ DELETE SINGLE ISSUE
========================================================= */
/**
 * @swagger
 * /issues/{id}:
 *   delete:
 *     summary: Delete a single issue record permanently
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Issue deleted successfully
 *       404:
 *         description: Issue not found
 */


/* =========================================================
   🧹 CLEAR RETURNED HISTORY
========================================================= */
/**
 * @swagger
 * /issues/clear-returned-history:
 *   delete:
 *     summary: Delete all returned issue history
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returned history cleared successfully
 */

import { Router } from "express";
import auth from "../../middlewares/auth.js";
import validate from "../../middlewares/validate.js";

import {
  borrowBookController,
  getMemberIssuesController,
  returnBookController,
  getAllIssuesFeedController,
  getMemberAllowanceMetricsController,
  updateIssueParametersController,
  deleteSingleIssueController,         // ✨ NEW
  clearReturnedHistoryController       // ✨ NEW
} from "./issue.controller.js";

import {
  createIssueSchema,
  updateIssueSchema,
  getMemberAllowanceSchema,
  returnBookSchema,
  getMemberIssuesSchema, 
} from "./issue.validation.js";

const router = Router();

router.get("/", auth, getAllIssuesFeedController);
router.get("/overdue", auth); 
router.delete("/clear-returned-history", auth, clearReturnedHistoryController);
router.get("/member-allowance/:memberId", auth, validate(getMemberAllowanceSchema), getMemberAllowanceMetricsController);
router.get("/member-stats/:memberId", auth, validate(getMemberAllowanceSchema), getMemberAllowanceMetricsController);
router.get("/member/:memberId", auth, validate(getMemberIssuesSchema), getMemberIssuesController);
router.post("/borrow", auth, validate(createIssueSchema), borrowBookController);
router.post("/return", auth, validate(returnBookSchema), returnBookController);
router.patch("/:id", auth, validate(updateIssueSchema), updateIssueParametersController);
router.delete("/:id", auth, deleteSingleIssueController);

export default router;