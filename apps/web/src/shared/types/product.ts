import type { ExternalEventSource, SeatingMode } from "@/entities/event/model";

export interface CreateEventInput {
  source: ExternalEventSource;
  externalId?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  date: string;
  time: string;
  venueName: string;
  address?: string;
  city?: string;
  capacity: number;
  price: number;
  currency: string;
  seatingMode: SeatingMode;
}
