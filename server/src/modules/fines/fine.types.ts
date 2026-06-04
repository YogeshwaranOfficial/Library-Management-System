export interface PayFinePayload {
  fine_id: string;
  paidDate?: string; // ISO String format sent from the frontend date input panel
}