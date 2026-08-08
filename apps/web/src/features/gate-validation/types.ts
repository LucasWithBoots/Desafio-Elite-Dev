import type { TicketDetails } from "@/entities/ticket/model";

export type GateValidationStatus =
  | "valid"
  | "invalid"
  | "already-used"
  | "wrong-event";

export interface GateValidationResult {
  status: GateValidationStatus;
  message: string;
  ticket?: TicketDetails;
}
