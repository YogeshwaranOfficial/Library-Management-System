import { Request, Response, NextFunction } from "express";
import { PlansService } from "./plans.service.js";

export class PlansController {
  private plansService: PlansService;

  constructor() {
    this.plansService = new PlansService();
  }

  getPlans = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const plans = await this.plansService.listAllPlans();
      res.status(200).json({
        success: true,
        message: "Active subscription scheme configuration tiers successfully fetched.",
        data: plans
      });
    } catch (error) {
      next(error);
    }
  };

  createPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Note: Zod validation runner upstream intercepts errors automatically.
      const newPlan = await this.plansService.addPlan(req.body);
      res.status(201).json({
        success: true,
        message: "New structural strategy scheme framework deployed successfully.",
        data: newPlan
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unhandled calculation error occurred.";
      res.status(422).json({ success: false, message: errorMessage });
    }
  };

  editPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updatedPlan = await this.plansService.editPlan(req.body);
      res.status(200).json({
        success: true,
        message: "Target configuration parameters updated successfully.",
        data: updatedPlan
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unhandled update validation error occurred.";
      res.status(422).json({ success: false, message: errorMessage });
    }
  };

  deletePlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { membership_plan_id } = req.body;
      await this.plansService.purgePlan(membership_plan_id);

      res.status(200).json({
        success: true,
        message: "Targeted plan tracking structure cleanly dropped from database."
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during record deletion.";
      res.status(400).json({ success: false, message: errorMessage });
    }
  };
}