import { PlansRepository } from "./plans.repository.js";
import { ICreatePlanDTO, IUpdatePlanDTO } from "./plans.types.js";
import { Op } from "sequelize";
import MembershipPlan from "../../database/models/MembershipPlan.js";

export class PlansService {
  private plansRepository: PlansRepository;

  constructor() {
    this.plansRepository = new PlansRepository();
  }

  async listAllPlans(): Promise<MembershipPlan[]> {
    return await this.plansRepository.getAllPlans();
  }

  async addPlan(data: ICreatePlanDTO): Promise<MembershipPlan> {
    const existingPlan = await this.plansRepository.findPlanByName(data.plan_name);
    if (existingPlan) {
      throw new Error(`A scheme model with profile descriptor name "${data.plan_name}" already exists.`);
    }
    return await this.plansRepository.createPlan(data);
  }

  async editPlan(data: IUpdatePlanDTO): Promise<MembershipPlan> {
    const targetPlan = await this.plansRepository.findPlanById(data.membership_plan_id);
    if (!targetPlan) {
      throw new Error("Target strategy scheme payload reference record not found.");
    }

    // Verify name uniqueness isn't hijacked by a separate profile model context
    const structuralConflict = await MembershipPlan.findOne({
      where: {
        plan_name: data.plan_name,
        membership_plan_id: { [Op.ne]: data.membership_plan_id }
      }
    });

    if (structuralConflict) {
      throw new Error(`Strategic name conflict framework. Profile alias "${data.plan_name}" is assigned elsewhere.`);
    }

    await this.plansRepository.updatePlan(data.membership_plan_id, {
      plan_name: data.plan_name,
      price: data.price,
      duration_days: data.duration_days,
      max_books_allowed: data.max_books_allowed
    });

    const refreshedPlan = await this.plansRepository.findPlanById(data.membership_plan_id);
    return refreshedPlan!;
  }

  async purgePlan(id: string): Promise<void> {
    const targetPlan = await this.plansRepository.findPlanById(id);
    if (!targetPlan) {
      throw new Error("Target deletion operation rejected. Record already dead or dropped.");
    }
    
    // Note: If relational constraint issues pop up, capture them gracefully here
    await this.plansRepository.deletePlan(id);
  }
}