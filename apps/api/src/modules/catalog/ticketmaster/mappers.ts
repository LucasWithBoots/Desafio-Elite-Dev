import type {
  EventCatalogItem,
  TicketmasterEvent,
  TicketmasterImage,
  TicketmasterVenue,
} from "./types.js";

function pickBestImage(images: TicketmasterImage[] = []) {
  const usableImages = images.filter((image) => image.url && !image.fallback);
  const sortedImages = [...(usableImages.length ? usableImages : images)].sort(
    (first, second) => {
      const firstRatioScore = first.ratio === "16_9" ? 1 : 0;
      const secondRatioScore = second.ratio === "16_9" ? 1 : 0;
      const firstSize = first.width ?? 0;
      const secondSize = second.width ?? 0;

      return secondRatioScore - firstRatioScore || secondSize - firstSize;
    },
  );

  return sortedImages[0]?.url;
}

function pickPrimaryClassification(event: TicketmasterEvent) {
  return (
    event.classifications?.find((classification) => classification.primary) ??
    event.classifications?.[0]
  );
}

function pickPrimaryVenue(event: TicketmasterEvent): TicketmasterVenue | undefined {
  return event._embedded?.venues?.[0];
}

function getStartDate(event: TicketmasterEvent) {
  if (event.dates?.start?.dateTime) {
    return event.dates.start.dateTime;
  }

  const localDate = event.dates?.start?.localDate;
  const localTime = event.dates?.start?.localTime ?? "00:00:00";

  return localDate ? `${localDate}T${localTime}` : undefined;
}

function getAddress(venue?: TicketmasterVenue) {
  return [
    venue?.address?.line1,
    venue?.address?.line2,
    venue?.address?.line3,
  ]
    .filter(Boolean)
    .join(", ");
}

function getPriceRange(event: TicketmasterEvent) {
  const ranges = event.priceRanges ?? [];
  const minPrices = ranges
    .map((range) => range.min)
    .filter((price): price is number => typeof price === "number");
  const maxPrices = ranges
    .map((range) => range.max)
    .filter((price): price is number => typeof price === "number");

  return {
    minPrice: minPrices.length ? Math.min(...minPrices) : undefined,
    maxPrice: maxPrices.length ? Math.max(...maxPrices) : undefined,
    currency: ranges.find((range) => range.currency)?.currency,
  };
}

export function toTicketmasterCatalogItem(
  event: TicketmasterEvent,
): EventCatalogItem & {
  address?: string;
  attractions?: string[];
  venueId?: string;
} {
  const venue = pickPrimaryVenue(event);
  const classification = pickPrimaryClassification(event);
  const priceRange = getPriceRange(event);
  const address = getAddress(venue);

  return {
    externalId: event.id,
    source: "ticketmaster",
    title: event.name,
    description:
      event.description ?? event.info ?? event.additionalInfo ?? event.pleaseNote,
    imageUrl: pickBestImage(event.images),
    externalUrl: event.url,
    category: classification?.segment?.name,
    genre: classification?.genre?.name ?? classification?.subGenre?.name,
    venueId: venue?.id,
    venueName: venue?.name,
    address: address || undefined,
    city: venue?.city?.name ?? event.place?.city?.name,
    country: venue?.country?.countryCode ?? event.place?.country?.countryCode,
    startsAt: getStartDate(event),
    timezone: event.dates?.timezone ?? venue?.timezone,
    minPrice: priceRange.minPrice,
    maxPrice: priceRange.maxPrice,
    currency: priceRange.currency,
    attractions: event._embedded?.attractions?.map((attraction) => attraction.name),
  };
}
