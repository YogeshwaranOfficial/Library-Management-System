import { Router } from "express";
import auth from "../../middlewares/auth.js";
import validate from "../../middlewares/validate.js";
import {
  getCollectedFinesController, // Changed from getAllFinesController
  getPendingFinesController,
  getMemberFinesController,
  payFineController,
  purgeFineController,
  restoreFineController         // Added for manual invoice clearing
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

// 🟢 Added to handle the purgeFineMutation soft/hard delete manual overrides
router.delete("/:id", auth, validate(purgeFineSchema) ,purgeFineController);

export default router;