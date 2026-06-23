export interface SystemUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
}

export interface MembershipPlan {
  membership_plan_id: string;
  plan_name: string;
  duration_days: number;
  price: number;
  max_books_allowed: number;
}

export interface LibraryMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  membershipPlanId: string;
  membershipPlanName: string;
  activationDate: string;
  expiryDate: string;
  isActive: boolean;
}