export interface CheckoutSummary {
  eventId: string;
  seatId?: string;
  quantity: number;
  total: number;
  currency: string;
}
