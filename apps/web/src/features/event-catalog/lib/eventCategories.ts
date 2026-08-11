import type { Event } from "@/entities/event/model";

export const ALL_EVENT_CATEGORIES = "All";

const categoryLabels: Record<string, string> = {
  [ALL_EVENT_CATEGORIES]: "Todos",
  Art: "Arte",
  "Arts & Theatre": "Arte e teatro",
  Ballet: "Ballet",
  Festivals: "Festivais",
  "Kids & Family": "Familia",
  Music: "Shows",
  Sports: "Esportes",
  Theatre: "Teatro",
  Workshops: "Workshops",
};

export function getAvailableEventCategories(
  events: Array<Pick<Event, "category" | "genre">> = [],
) {
  const categories = new Set<string>();

  events.forEach((event) => {
    categories.add(getEventCategory(event));
  });

  return [ALL_EVENT_CATEGORIES, ...Array.from(categories).sort((first, second) =>
    getEventCategoryLabel(first).localeCompare(
      getEventCategoryLabel(second),
      "pt-BR",
    ),
  )];
}

export function getEventCategory(event: Pick<Event, "category" | "genre">) {
  return event.category?.trim() || event.genre?.trim() || "Outros";
}

export function getEventCategoryLabel(category: string) {
  return categoryLabels[category] ?? category;
}
