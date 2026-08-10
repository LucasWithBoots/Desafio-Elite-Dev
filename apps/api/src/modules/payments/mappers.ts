import type { Payment } from "@prisma/client";

const paymentStatusMap = {
  PENDING: "pending",
  APPROVED: "approved",
  DECLINED: "declined",
} as const;

export function toPaymentDto(payment: Payment) {
  return {
    id: payment.id,
    reservationId: payment.reservationId,
    amount: payment.amountCents / 100,
    currency: payment.currency,
    status: paymentStatusMap[payment.status],
    createdAt: payment.createdAt.toISOString(),
  };
}
