/**
 * @swagger
 * /dashboard/overview:
 *   get:
 *     summary: Fetch high-level tracking counts for dashboard cards
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Aggregated card values processed successfully
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
 *
 *                     totalMembers:
 *                       type: integer
 *
 *                     activeMembers:
 *                       type: integer
 *
 *                     expiredMembers:
 *                       type: integer
 *
 *                     issuedBooks:
 *                       type: integer
 *
 *                     returnedBooks:
 *                       type: integer
 *
 *                     overdueBooks:
 *                       type: integer
 *
 *                     unpaidFines:
 *                       type: number
 */

/**
 * @swagger
 * /dashboard/analytics/popular-books:
 *   get:
 *     summary: Retrieve library circulation rankings (Top 5 popular items)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Array list of high popularity book assets returned successfully
 */

/**
 * @swagger
 * /dashboard/reports/monthly-fines:
 *   get:
 *     summary: Fetch chronological monthly fine income collection records
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Monthly fine report matrix structured successfully
 */

/**
 * @swagger
 * /dashboard/analytics/recent-issues:
 *   get:
 *     summary: Fetch most recent book checkouts for activity streaming
 *     description: Retrieves the latest book issuance records including book titles, borrowing member details, and timeline stats to populate dashboard real-time activity tracking streams.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Latest book transactions tracking matrices processed and compiled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 data:
 *                   type: array
 *                   description: Chronological list of the most recent library checkouts
 *
 *                   items:
 *                     type: object
 *
 *                     properties:
 *                       issueId:
 *                         type: string
 *                         format: uuid
 *                         example: "40000011-4444-4444-4444-444444444444"
 *
 *                       borrowedDate:
 *                         type: string
 *                         format: date
 *                         example: "2026-05-20"
 *
 *                       dueDate:
 *                         type: string
 *                         format: date
 *                         example: "2026-06-03"
 *
 *                       status:
 *                         type: string
 *                         enum: [BORROWED, RETURNED, OVERDUE]
 *                         example: "BORROWED"
 *
 *                       book:
 *                         type: object
 *
 *                         properties:
 *                           bookId:
 *                             type: string
 *                             format: uuid
 *                             example: "b0000004-3333-3333-3333-333333333333"
 *
 *                           bookName:
 *                             type: string
 *                             example: "You Don't Know JS"
 *
 *                           bookAuthor:
 *                             type: string
 *                             example: "Kyle Simpson"
 *
 *                       member:
 *                         type: object
 *
 *                         properties:
 *                           memberId:
 *                             type: string
 *                             format: uuid
 *                             example: "20000015-2222-2222-2222-222222222222"
 *
 *                           memberName:
 *                             type: string
 *                             example: "Tejas Mehta"
 *
 *                           gmail:
 *                             type: string
 *                             example: "tejas.mehta@gmail.com"
 *
 *       401:
 *         description: Unauthorized access due to missing or structurally malformed JSON Web Tokens
 *
 *       403:
 *         description: Forbidden request access level clearance exceptions (Requires LIBRARIAN privileges)
 *
 *       500:
 *         description: Internal processing failures while querying transactional analytics logs
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