export type PaymentStatus = "pending" | "approved" | "declined";

export interface Payment {
  id: string;
  reservationId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
}
