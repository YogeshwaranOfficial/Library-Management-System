export interface ICreatePlanDTO {
  plan_name: string;
  price: number;
  duration_days: number;
  max_books_allowed: number;
}

export interface IUpdatePlanDTO extends ICreatePlanDTO {
  membership_plan_id: string;
}

export interface IPlanDeleteDTO {
  membership_plan_id: string;
}