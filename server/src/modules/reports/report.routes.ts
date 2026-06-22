import { Router } from "express";
import { ReportController } from "./report.controller.js";
import { generateReportValidation, getDependentOptionsValidation } from "./report.validation.js";
import  validate  from "../../middlewares/validate.js"; // Adjust path if needed

const router = Router();
const reportController = new ReportController();

/**
 * @route   GET /api/v1/reports/dependent-options
 * @desc    Fetch cascading target cross-reference choices to feed dependency drop-down menus
 * @access  Private / Librarian Protected
 */
router.get(
  "/dependent-options",
  validate(getDependentOptionsValidation),
  reportController.getDependentDropdownOptions
);

/**
 * @route   GET /api/v1/reports
 * @desc    Compile transactional relational analytical matrix statements on-demand
 * @access  Private / Librarian Protected
 */
router.get(
  "/",
  validate(generateReportValidation),
  reportController.generateReport
);

export default router;