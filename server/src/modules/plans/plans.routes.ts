import { Router } from "express";
import validate from "../../middlewares/validate.js";
import { PlansController } from "./plans.controller.js";
import { createPlanValidation, updatePlanValidation, deletePlanValidation } from "./plans.validation.js";

const router = Router();
const controller = new PlansController();

// /plan context target loop binds
router.get("/", controller.getPlans);
router.post("/create", validate(createPlanValidation), controller.createPlan);
router.patch("/edit", validate(updatePlanValidation), controller.editPlan);
router.delete("/delete", validate(deletePlanValidation), controller.deletePlan);

export default router;