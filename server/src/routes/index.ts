import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import memberRoutes from "../modules/members/member.routes.js";
import bookRoutes from "../modules/books/book.routes.js"
import issueRoutes from "../modules/issues/issue.routes.js";



const router = Router();

router.use("/auth", authRoutes);
router.use("/members", memberRoutes);
router.use("/books", bookRoutes)
router.use("/issues", issueRoutes)

export default router;