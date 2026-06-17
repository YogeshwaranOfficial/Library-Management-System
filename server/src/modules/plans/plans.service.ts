import { PlansRepository } from "./plans.repository.js";
import { ICreatePlanDTO, IUpdatePlanDTO } from "./plans.types.js";
import { Op, literal } from "sequelize";
import MembershipPlan from "../../database/models/MembershipPlan.js";
import Member from "../../database/models/Member.js";

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

    const structuralConflict = await MembershipPlan.findOne({
      where: {
        plan_name: data.plan_name,
        membership_plan_id: { [Op.ne]: data.membership_plan_id }
      }
    });

    if (structuralConflict) {
      throw new Error(`Strategic name conflict framework. Profile alias "${data.plan_name}" is assigned elsewhere.`);
    }

    // 🌟 PROFESSIONAL CALCULATION LAYER: Calculate duration days delta differential
    const oldDuration = Number(targetPlan.duration_days);
    const newDuration = Number(data.duration_days);
    const daysDifference = newDuration - oldDuration;

    // Update the core plan configuration settings
    await this.plansRepository.updatePlan(data.membership_plan_id, {
      plan_name: data.plan_name,
      price: data.price,
      duration_days: data.duration_days,
      max_books_allowed: data.max_books_allowed
    });

    // 🌟 CASCADE DATABASE MIGRATION ENGINE
    // If the timeline shifted, cascade update every single member attached to this blueprint
    if (daysDifference !== 0) {
      await Member.update(
        {
          // Dynamically adds or subtracts days across your SQL date records
          expiry_date: literal(`expiry_date + INTERVAL '${daysDifference} days'`),
        },
        {
          where: {
            membership_plan_id: data.membership_plan_id,
          }
        }
      );

      // Re-verify expiration boundaries for the modified records instantly
      const todayString = new Date().toISOString().split('T')[0];
      await Member.update(
        { membership_status: "EXPIRED" },
        {
          where: {
            membership_plan_id: data.membership_plan_id,
            expiry_date: { [Op.lt]: todayString }
          }
        }
      );
      
      // Reverse check: Re-activate profiles if timeline extensions pushed them out of expiration
      await Member.update(
        { membership_status: "ACTIVE" },
        {
          where: {
            membership_plan_id: data.membership_plan_id,
            expiry_date: { [Op.gte]: todayString },
            membership_status: "EXPIRED"
          }
        }
      );
    }

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