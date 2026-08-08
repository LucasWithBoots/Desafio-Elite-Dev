import type { Event } from "@/entities/event/model";

export const mockEvents: Event[] = [
  {
    id: "evt_rock-night",
    title: "Rock Night Live",
    description: "Show ao vivo com mapa de assentos e validacao por QR Code.",
    imageUrl:
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80",
    startsAt: "2026-09-12T21:00:00.000-03:00",
    venueName: "Arena Centro",
    address: "Av. Principal, 1000",
    city: "Sao Paulo",
    price: 120,
    currency: "BRL",
    capacity: 120,
    availableTickets: 84,
    seatingMode: "seat-map",
    status: "published",
    externalSource: "ticketmaster",
    externalId: "tm_rock-night",
  },
  {
    id: "evt_indie-session",
    title: "Indie Session",
    description: "Evento manual para validar o fluxo quando a API externa nao encontra o item.",
    imageUrl:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    startsAt: "2026-09-20T19:30:00.000-03:00",
    venueName: "Teatro Luz",
    address: "Rua das Flores, 48",
    city: "Sao Paulo",
    price: 86,
    currency: "BRL",
    capacity: 80,
    availableTickets: 32,
    seatingMode: "seat-map",
    status: "published",
    externalSource: "manual",
  },
];
