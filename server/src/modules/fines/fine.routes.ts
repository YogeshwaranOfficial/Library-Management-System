import { Router } from "express";
import auth from "../../middlewares/auth.js";
import validate from "../../middlewares/validate.js";
import {
  getAllFinesController,
  getMemberFinesController,
  getPendingFinesController,
  payFineController,
} from "./fine.controller.js";
import { payFineSchema } from "./fine.validation.js";

const router = Router();

router.get("/", auth, getAllFinesController);
router.get("/pending", auth, getPendingFinesController);
router.get("/member/:memberId", auth, getMemberFinesController);
router.patch("/pay", auth, validate(payFineSchema), payFineController);

export default router; 