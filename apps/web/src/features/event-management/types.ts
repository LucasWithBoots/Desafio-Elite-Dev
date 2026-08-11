import type { CreateEventInput } from "@/shared/types/product";

export type EventFormValues = CreateEventInput;

export interface TicketmasterCatalogItem {
  externalId: string;
  source: "ticketmaster";
  title: string;
  description?: string;
  imageUrl?: string;
  externalUrl?: string;
  category?: string;
  genre?: string;
  venueName?: string;
  address?: string;
  city?: string;
  country?: string;
  startsAt?: string;
  timezone?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  attractions?: string[];
  venueId?: string;
}

export interface TicketmasterSearchResponse {
  items: TicketmasterCatalogItem[];
  page?: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

export interface ImportTicketmasterEventInput {
  capacity: number;
  price?: number;
  currency?: string;
  seatingMode: "seat-map" | "general-admission";
  publish?: boolean;
}
