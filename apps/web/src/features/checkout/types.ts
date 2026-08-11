export interface CheckoutSummary {
  eventId: string;
  seatId?: string;
  quantity: number;
  total: number;
  currency: string;
}

export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "expired";

export interface Reservation {
  id: string;
  eventId: string;
  customerId: string;
  seatId?: string;
  quantity: number;
  status: ReservationStatus;
  amount: number;
  currency: string;
  expiresAt?: string;
  createdAt: string;
}
