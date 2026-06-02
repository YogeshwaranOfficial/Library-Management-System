export interface FineRecord {
  id: string; 
  issueId: string; 
  memberName: string; 
  bookTitle: string;
  delayedDays: number;
  fineAmount: number;
  paidStatus: boolean; 
  paidDate: string | null;
}