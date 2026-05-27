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