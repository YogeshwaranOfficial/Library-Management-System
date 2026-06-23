import { Request } from "express";

export type PivotMode = "MEMBER" | "BOOK" | "NONE";
export type DurationWindow = "ALL" | "WEEKLY" | "MONTHLY" | "YEARLY";

export interface ReportQueryParams {
  pivot: PivotMode;
  primaryId: string;
  secondaryId?: string | undefined; 
  duration: DurationWindow;
}

export interface DependentOptionsParams {
  pivot: PivotMode;
  primaryId: string;
}

// --- SEQUELIZE DATABASE MODEL DATA LAYER TYPES ---

export interface DBUserAttributes {
  name: string;
  gmail?: string;
  phone_number?: string;
}

export interface DBMemberAttributes {
  member_id: string;
  user_id: string;
  membership_status: "ACTIVE" | "EXPIRED" | "INACTIVE";
  expiry_date?: Date | string;
  user?: DBUserAttributes;
}

export interface DBBookAttributes {
  book_id: string;
  book_name: string;
  book_author: string;
  isbn: string;
}

export interface DBFineAttributes {
  fine_amount: number | string;
  paid_status: string;
}

export interface DBIssueAttributes {
  issue_id?: string;
  id?: string;
  borrowed_date: string;
  return_date?: string;
  issue_status: string;
  return_condition?: string;
  book?: DBBookAttributes;
  member?: DBMemberAttributes;
  fine?: DBFineAttributes;
}

/**
 * Declares the exact output shape returned by ReportRepository.generateDynamicReport
 */
export interface DBReportRepositoryOutput {
  pivot: PivotMode;
  duration: DurationWindow;
  profile: DBMemberAttributes & DBBookAttributes & any; // Union allows runtime access to either model safely
  records: DBIssueAttributes[];
}

// --- FRONTEND SANITIZED RESPONSE DATA TYPES ---

export interface FormattedLogEntry {
  id: string;
  member: string;
  book: string;
  date: string;
  returnDate: string;
  status: string;
  condition: string;
  fine: string;
}

export interface FormattedProfileHeader {
  id: string;
  name: string;
  phone: string;
  email: string;
  extraIdentifier?: string | undefined;
}

export interface FormattedReportResponse {
  type: PivotMode;
  duration: DurationWindow;
  profile: FormattedProfileHeader;
  logs: FormattedLogEntry[];
}

export interface DependentDropdownOption {
  id: string;
  name: string;
  subtext: string;
}

// --- EXPRESS ROUTER TYPING CONTROLLER WRAPPERS ---

export interface GenerateReportRequest extends Request {
  query: {
    pivot: PivotMode;
    primaryId: string;
    secondaryId?: string;
    duration?: DurationWindow;
  };
}

export interface GetDependentOptionsRequest extends Request {
  query: {
    pivot: PivotMode;
    primaryId: string;
  };
}