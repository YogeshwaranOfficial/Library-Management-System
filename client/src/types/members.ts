export interface SystemUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  durationMonths: number;
  price: number;
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