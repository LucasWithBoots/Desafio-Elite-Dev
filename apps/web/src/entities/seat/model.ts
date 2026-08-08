export type SeatStatus = "available" | "selected" | "reserved" | "sold";

export interface Seat {
  id: string;
  eventId: string;
  row: string;
  number: number;
  label: string;
  status: SeatStatus;
}
