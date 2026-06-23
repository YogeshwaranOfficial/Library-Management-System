import MembershipPlan from "../../database/models/MembershipPlan.js"; // Adjust path to match your layout setup
import { CreationAttributes } from "sequelize"; // Adjust path to match your layout setup
import { ICreatePlanDTO } from "./plans.types.js";

export class PlansRepository {
  
  async getAllPlans(): Promise<MembershipPlan[]> {
    return await MembershipPlan.findAll({
      order: [["created_at", "DESC"]]
    });
  }

  async findPlanById(id: string): Promise<MembershipPlan | null> {
    return await MembershipPlan.findByPk(id);
  }

  async findPlanByName(name: string): Promise<MembershipPlan | null> {
    return await MembershipPlan.findOne({
      where: { plan_name: name }
    });
  }

  async createPlan(data: ICreatePlanDTO): Promise<MembershipPlan> {
    // Cast the payload cleanly into the database Model's exact creation attributes contract
    const insertPayload = data as CreationAttributes<MembershipPlan>;
    return await MembershipPlan.create(insertPayload);
  }

  async updatePlan(id: string, data: Partial<ICreatePlanDTO>): Promise<[number]> {
    return await MembershipPlan.update(data, {
      where: { membership_plan_id: id }
    });
  }

  async deletePlan(id: string): Promise<number> {
    return await MembershipPlan.destroy({
      where: { membership_plan_id: id }
    });
  }
}