export interface CreateMemberPayload {
  user_id: string;
  membership_plan_id: string;
  start_date: string;
  expiry_date: string;
}

export interface UpdateMemberPayload {
  membership_plan_id?: string;
  start_date?: string;
  expiry_date?: string;
  membership_status?: "ACTIVE" | "EXPIRED";
}

export interface MemberQuery {
  page?: number;
  limit?: number;
  search?: string;
  plan?: any;   // 💡 Added to match the router string parameter parsing
  status?: any; // 💡 Added to match the router string parameter parsing
  membership_status?: "ACTIVE" | "EXPIRED";
}

// 💡 NEW DEFINITION: Type structure for users eligible to become subscribers
export interface AvailableMemberUser {
  id: string;        // Formatted/mapped from database 'uuid'
  name: string;      // User's name
  email: string;     // Formatted/mapped from database 'gmail'
  phoneNumber: string; // Formatted/mapped from database 'phone_number'
}