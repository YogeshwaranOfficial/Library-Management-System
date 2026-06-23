/**
 * @swagger
 * tags:
 *   name: Fines
 *   description: Fine management APIs for library overdue payments and ledger tracking
 */

/**
 * @swagger
 * /fines/collected:
 *   get:
 *     summary: Retrieve all collected (paid) fines history
 *     tags: [Fines]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Fines historical collection database records fetched successfully
 *
 *       401:
 *         description: Unauthorized access token missing or invalid
 */

/**
 * @swagger
 * /fines/pending:
 *   get:
 *     summary: Retrieve all pending unpaid fines
 *     tags: [Fines]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Pending invoices fetched successfully
 *
 *       401:
 *         description: Unauthorized access token missing or invalid
 */

/**
 * @swagger
 * /fines/pay:
 *   patch:
 *     summary: Pay a fine and mark it as settled
 *     tags: [Fines]
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
 *               - fine_id
 *               - paymentMethod
 *
 *             properties:
 *               fine_id:
 *                 type: string
 *                 format: uuid
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *
 *               paidDate:
 *                 type: string
 *                 example: "2026-06-11"
 *
 *               paymentMethod:
 *                 type: string
 *                 enum: [CASH, CARD, UPI]
 *                 example: UPI
 *
 *     responses:
 *       200:
 *         description: Fine paid successfully. Ledger updated.
 *
 *       400:
 *         description: Invalid request or fine already settled
 *
 *       404:
 *         description: Fine not found
 */

/**
 * @swagger
 * /fines/member/{memberId}:
 *   get:
 *     summary: Retrieve all fines for a specific member
 *     tags: [Fines]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique member ID
 *
 *     responses:
 *       200:
 *         description: Member fine profile portfolio loaded successfully
 *
 *       400:
 *         description: Invalid member ID format
 *
 *       401:
 *         description: Unauthorized access
 */

/**
 * @swagger
 * /fines/restore/{id}:
 *   patch:
 *     summary: Restore a previously settled fine back to active ledger
 *     tags: [Fines]
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
 *         description: Fine ID
 *
 *     responses:
 *       200:
 *         description: Invoice restored successfully to active ledger
 *
 *       404:
 *         description: Fine not found
 */

/**
 * @swagger
 * /fines/{id}:
 *   delete:
 *     summary: Permanently delete a fine record (purge)
 *     tags: [Fines]
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
 *         description: Fine ID to delete
 *
 *     responses:
 *       200:
 *         description: Fine record permanently removed from ledger
 *
 *       404:
 *         description: Fine not found
 */


import { Router } from "express";
import auth from "../../middlewares/auth.js";
import validate from "../../middlewares/validate.js";
import {
  getCollectedFinesController, // Changed from getAllFinesController
  getPendingFinesController,
  getMemberFinesController,
  payFineController,
  purgeFineController,
  restoreFineController,
  fineController       // Added for manual invoice clearing
} from "./fine.controller.js";
import { payFineSchema, restoreFineSchema, purgeFineSchema, getMemberFinesSchema } from "./fine.validation.js";

const router = Router();



// 🟢 Changed from "/" to "/collected" to perfectly match your frontend history tab query
router.get("/collected", auth, getCollectedFinesController);

// 🔒 Kept as-is (Matches your frontend active defaulters tab query)
router.get("/pending", auth, getPendingFinesController);


// 🔒 Kept as-is (Matches your processPaymentMutation patch request)
router.patch("/pay", auth, validate(payFineSchema), payFineController);

// 🔒 Kept as-is (Useful for member dashboard fine lists)
router.get("/member/:memberId", auth, validate(getMemberFinesSchema), getMemberFinesController);

// Example: In your fine.routes.ts
router.patch("/restore/:id", auth, validate(restoreFineSchema), restoreFineController);

// Add a POST or PATCH endpoint specifically for manual sync triggers
router.patch("/recalculate-ledger", fineController.triggerForceRecalculate);

// 🟢 Added to handle the purgeFineMutation soft/hard delete manual overrides
router.delete("/:id", auth, validate(purgeFineSchema) ,purgeFineController);

export default router;