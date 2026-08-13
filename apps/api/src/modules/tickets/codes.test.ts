import assert from "node:assert/strict";
import test from "node:test";
import { createTicketPayload, verifyTicketPayload } from "./codes.js";

test("accepts a ticket payload signed by the server", () => {
  const payload = createTicketPayload("tck_test", "evt_test", "usr_test");

  assert.deepEqual(verifyTicketPayload(payload), {
    version: 1,
    ticketId: "tck_test",
    eventId: "evt_test",
    customerId: "usr_test",
    issuedAt: verifyTicketPayload(payload)?.issuedAt,
  });
});

test("rejects a signed payload after its claims are changed", () => {
  const payload = createTicketPayload("tck_test", "evt_test", "usr_test");
  const tamperedPayload = payload.replace("ELITE:TICKET:", "ELITE:TICKET:A");

  assert.equal(verifyTicketPayload(tamperedPayload), null);
});

test("rejects the legacy payload without a signature", () => {
  assert.equal(
    verifyTicketPayload("ELITE:TICKET:tck_test:evt_test:usr_test"),
    null,
  );
});
