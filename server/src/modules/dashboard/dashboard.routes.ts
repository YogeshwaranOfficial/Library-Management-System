/**
 * @swagger
 * /dashboard/metrics:
 *   get:
 *     summary: Fetch dashboard overview metrics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Dashboard overview fetched successfully
 *
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *
 *               properties:
 *                 success:
 *                   type: boolean
 *
 *                 data:
 *                   type: object
 *
 *                   properties:
 *                     totalBooks:
 *                       type: integer
 *                     totalMembers:
 *                       type: integer
 *                     activeMembers:
 *                       type: integer
 *                     expiredMembers:
 *                       type: integer
 *                     issuedBooks:
 *                       type: integer
 *                     returnedBooks:
 *                       type: integer
 *                     overdueBooks:
 *                       type: integer
 *                     unpaidFines:
 *                       type: number
 */

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Fetch complete dashboard summary with widgets
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Dashboard summary logs generated cleanly
 *
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *
 *               properties:
 *                 success:
 *                   type: boolean
 *
 *                 data:
 *                   type: object
 *
 *                   properties:
 *                     summary:
 *                       type: object
 *
 *                     widgets:
 *                       type: object
 *
 *                     overdueBooks:
 *                       type: array
 */

/**
 * @swagger
 * /dashboard/analytics/popular-books:
 *   get:
 *     summary: Retrieve top 5 most borrowed books
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Popular books fetched successfully
 *
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *
 *               properties:
 *                 success:
 *                   type: boolean
 *
 *                 data:
 *                   type: array
 *
 *                   items:
 *                     type: object
 *                     properties:
 *                       book_id:
 *                         type: string
 *                         format: uuid
 *                       book_name:
 *                         type: string
 *                       lending_count:
 *                         type: integer
 */

/**
 * @swagger
 * /dashboard/analytics/recent-issues:
 *   get:
 *     summary: Fetch most recent book checkouts
 *     description: Returns latest borrowing activities with book and member details
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Recent issues fetched successfully
 *
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *
 *               properties:
 *                 success:
 *                   type: boolean
 *
 *                 data:
 *                   type: array
 *
 *                   items:
 *                     type: object
 *
 *                     properties:
 *                       issue_id:
 *                         type: string
 *                         format: uuid
 *
 *                       member_name:
 *                         type: string
 *
 *                       book_name:
 *                         type: string
 *
 *                       borrowed_date:
 *                         type: string
 *                         format: date
 *
 *                       due_date:
 *                         type: string
 *                         format: date
 */

/**
 * @swagger
 * /dashboard/reports/monthly-fines:
 *   get:
 *     summary: Fetch monthly fine collection report
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Monthly fine analytics fetched successfully
 *
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *
 *               properties:
 *                 success:
 *                   type: boolean
 *
 *                 data:
 *                   type: array
 */

import { Router } from "express";

import auth from "../../middlewares/auth.js";

import {
  getDashboardSummaryController,
  getDashboardOverviewController,
  getMonthlyFineCollectionController,
  getPopularBooksController,
  getRecentIssuesController,
} from "./dashboard.controller.js";

const router = Router();


router.get("/metrics",auth, getDashboardOverviewController);
router.get("/summary", auth, getDashboardSummaryController);

router.get(
  "/analytics/popular-books",
  auth,
  getPopularBooksController
);


router.get(
  "/analytics/recent-issues",
  auth,
  getRecentIssuesController
);


router.get(
  "/reports/monthly-fines",
  auth,
  getMonthlyFineCollectionController
);

export default router;