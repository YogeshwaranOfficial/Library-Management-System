import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import memberRoutes from "../modules/members/member.routes.js";
import bookRoutes from "../modules/books/book.routes.js";
import categoriesRoutes from "../modules/categories/categories.routes.js";
import issueRoutes from "../modules/issues/issue.routes.js";
import fineRoutes from "../modules/fines/fine.routes.js";
import dashboardRoutes from "../modules/dashboard/dashboard.routes.js";
import azureRoutes from "../modules/azureAI/aiScanner.routes.js";
import adminRoutes from "../modules/admin/admin.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/members", memberRoutes);
router.use("/books", bookRoutes);
router.use("/categories",categoriesRoutes);
router.use("/issues", issueRoutes);
router.use("/fines", fineRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/ai",azureRoutes);
router.use("/admin",adminRoutes)

export default router;