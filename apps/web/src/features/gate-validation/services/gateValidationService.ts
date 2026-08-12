import { httpClient } from "@/shared/api/http-client";
import type { GateValidationResult } from "../types";

export interface ValidateTicketInput {
  qrPayload?: string;
  manualCode?: string;
  eventId?: string;
}

export const gateValidationService = {
  validateTicket(input: ValidateTicketInput) {
    return httpClient<GateValidationResult>("/gate/validate", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
