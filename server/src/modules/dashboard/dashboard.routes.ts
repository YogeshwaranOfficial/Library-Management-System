/**
 * @swagger
 * /dashboard/overview:
 * get:
 * summary: Fetch high-level tracking counts for dashboard cards
 * tags: [Dashboard]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Aggregated card values processed successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success:
 * type: boolean
 * data:
 * type: object
 * properties:
 * totalBooks:
 * type: integer
 * totalMembers:
 * type: integer
 * activeMembers:
 * type: integer
 * expiredMembers:
 * type: integer
 * issuedBooks:
 * type: integer
 * returnedBooks:
 * type: integer
 * overdueBooks:
 * type: integer
 * unpaidFines:
 * type: number
 */

/**
 * @swagger
 * /dashboard/analytics/popular-books:
 * get:
 * summary: Retrieve library circulation rankings (Top 5 popular items)
 * tags: [Dashboard]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Array list of high popularity book assets returned successfully
 */

/**
 * @swagger
 * /dashboard/reports/monthly-fines:
 * get:
 * summary: Fetch chronological monthly fine income collection records
 * tags: [Dashboard]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Monthly fine report matrix structured successfully
 */


import { Router } from "express";

import auth from "../../middlewares/auth.js";

import {
  getDashboardOverviewController,
  getMonthlyFineCollectionController,
  getPopularBooksController,
  getRecentIssuesController,
} from "./dashboard.controller.js";

const router = Router();

router.get(
  "/overview",
  auth,
  getDashboardOverviewController
);

router.get(
  "/popular-books",
  auth,
  getPopularBooksController
);

router.get(
  "/recent-issues",
  auth,
  getRecentIssuesController
);

router.get(
  "/fine-analytics",
  auth,
  getMonthlyFineCollectionController
);

export default router;