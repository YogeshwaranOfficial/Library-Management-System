export interface CreateMemberPayload {
  user_id: string;
  membership_plan_id: string;
  start_date?: string;
  expiry_date?: string;
}

export interface UpdateMemberPayload {
  membership_plan_id?: string | undefined;
  start_date?: string | undefined;
  expiry_date?: string | undefined;
  membership_status?: "ACTIVE" | "EXPIRED" | undefined;
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

// ✨ NEW: Defines the payload contract returned by the lookup search engine
export interface SearchMemberResult {
  member_id: string;
  name: string;
  phone_number: string;
  membership_status: string;
  expiry_date: string;
  plan_name: string;
  maxAllowed: number;
  currentBorrows: number;
  compliance: {
    status: "GOOD" | "EXPIRED" | "LIMIT_EXCEEDED" | "WARNING_LAST_SLOT";
    message: string;
    isBlocked: boolean;
  };
}

// =========================================================
// NEW: PLANS WITH METRICS DASHBOARD PAYLOAD CONTRACTS
// =========================================================
export interface PlanWithMetrics {
  membership_plan_id: string;
  plan_name: string;
  price: number;
  duration_days: number;
  description?: string;
  active_members_count: number;
  inactive_members_count: number;
  [key: string]: any; // Accommodates general Sequelize instance properties
}

export interface PlansDashboardResponse {
  meta: {
    total: number;
    globalActiveMembers: number;
    globalInactiveMembers: number;
  };
  data: PlanWithMetrics[];
}