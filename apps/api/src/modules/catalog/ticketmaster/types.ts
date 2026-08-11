export interface TicketmasterCollectionResponse<TItem> {
  _embedded?: Record<string, TItem[] | undefined>;
  _links?: TicketmasterLinks;
  page?: TicketmasterPage;
}

export interface TicketmasterSearchResponse {
  _embedded?: {
    events?: TicketmasterEvent[];
  };
  _links?: TicketmasterLinks;
  page?: TicketmasterPage;
}

export interface TicketmasterEvent {
  id: string;
  type?: string;
  locale?: string;
  name: string;
  description?: string;
  additionalInfo?: string;
  url?: string;
  images?: TicketmasterImage[];
  dates?: TicketmasterEventDates;
  sales?: TicketmasterSales;
  info?: string;
  pleaseNote?: string;
  priceRanges?: TicketmasterPriceRange[];
  seatmap?: TicketmasterSeatmap;
  classifications?: TicketmasterClassification[];
  promoter?: TicketmasterPromoter;
  promoters?: TicketmasterPromoter[];
  place?: TicketmasterPlace;
  test?: boolean;
  aliases?: string[];
  _embedded?: {
    venues?: TicketmasterVenue[];
    attractions?: TicketmasterAttraction[];
  };
  _links?: TicketmasterLinks;
}

export interface TicketmasterImage {
  ratio?: "16_9" | "3_2" | "4_3" | string;
  url: string;
  width?: number;
  height?: number;
  fallback?: boolean;
}

export interface TicketmasterEventDates {
  start?: {
    localDate?: string;
    localTime?: string;
    dateTime?: string;
    dateTBD?: boolean;
    dateTBA?: boolean;
    timeTBA?: boolean;
    noSpecificTime?: boolean;
  };
  timezone?: string;
  status?: {
    code?: "onsale" | "offsale" | "cancelled" | "postponed" | "rescheduled" | string;
  };
  spanMultipleDays?: boolean;
}

export interface TicketmasterSales {
  public?: {
    startDateTime?: string;
    startTBD?: boolean;
    startTBA?: boolean;
    endDateTime?: string;
  };
  presales?: Array<{
    name?: string;
    startDateTime?: string;
    endDateTime?: string;
  }>;
}

export interface TicketmasterPriceRange {
  type?: "standard" | "vip" | string;
  currency?: string;
  min?: number;
  max?: number;
}

export interface TicketmasterSeatmap {
  staticUrl?: string;
}

export interface TicketmasterClassification {
  primary?: boolean;
  segment?: TicketmasterClassificationItem;
  genre?: TicketmasterClassificationItem;
  subGenre?: TicketmasterClassificationItem;
  type?: TicketmasterClassificationItem;
  subType?: TicketmasterClassificationItem;
  family?: boolean;
}

export interface TicketmasterClassificationItem {
  id?: string;
  name?: string;
}

export interface TicketmasterVenue {
  id: string;
  name: string;
  type?: string;
  url?: string;
  locale?: string;
  postalCode?: string;
  timezone?: string;
  city?: { name?: string };
  state?: { name?: string; stateCode?: string };
  country?: { name?: string; countryCode?: string };
  address?: { line1?: string; line2?: string; line3?: string };
  location?: { latitude?: string; longitude?: string };
  images?: TicketmasterImage[];
}

export interface TicketmasterAttraction {
  id: string;
  name: string;
  type?: string;
  url?: string;
  locale?: string;
  images?: TicketmasterImage[];
  classifications?: TicketmasterClassification[];
  externalLinks?: Record<string, Array<{ url: string }>>;
}

export interface TicketmasterPromoter {
  id?: string;
  name?: string;
  description?: string;
}

export interface TicketmasterPlace {
  city?: { name?: string };
  state?: { name?: string; stateCode?: string };
  country?: { name?: string; countryCode?: string };
  address?: { line1?: string };
  location?: { latitude?: string; longitude?: string };
}

export interface TicketmasterLinks {
  self?: { href: string };
  next?: { href: string };
  prev?: { href: string };
  first?: { href: string };
  last?: { href: string };
}

export interface TicketmasterPage {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface EventCatalogItem {
  externalId: string;
  source: "ticketmaster";
  title: string;
  description?: string;
  imageUrl?: string;
  externalUrl?: string;
  category?: string;
  genre?: string;
  venueName?: string;
  city?: string;
  country?: string;
  startsAt?: string;
  timezone?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
}

export interface TicketmasterEventImagesResponse {
  images?: TicketmasterImage[];
}

export interface TicketmasterClassificationResponse {
  id: string;
  type?: string;
  segment?: {
    id?: string;
    name?: string;
  };
  genre?: {
    id?: string;
    name?: string;
  };
  subGenre?: {
    id?: string;
    name?: string;
  };
  family?: boolean;
}

export interface TicketmasterSuggestResponse {
  _embedded?: {
    events?: TicketmasterEvent[];
    attractions?: TicketmasterAttraction[];
    venues?: TicketmasterVenue[];
    products?: unknown[];
  };
  _links?: TicketmasterLinks;
}
