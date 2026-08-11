import type { Payment } from "@/entities/payment/model";
import type { TicketDetails } from "@/entities/ticket/model";
import { httpClient } from "@/shared/api/http-client";
import type { Reservation } from "../types";

export interface CreateReservationInput {
  eventId: string;
  seatId?: string;
  quantity?: number;
}

export interface SimulatePaymentInput {
  reservationId: string;
  approved: boolean;
}

export interface SimulatePaymentResponse {
  payment: Payment;
  ticket: TicketDetails | null;
}

export const checkoutService = {
  createReservation(input: CreateReservationInput) {
    return httpClient<Reservation>("/reservations", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  simulatePayment(input: SimulatePaymentInput) {
    return httpClient<SimulatePaymentResponse>("/payments/simulate", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
