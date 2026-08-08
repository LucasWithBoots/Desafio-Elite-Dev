export const routes = {
  login: "/login",
  events: "/events",
  eventDetails: "/events/:eventId",
  checkout: "/events/:eventId/checkout",
  myTickets: "/my-tickets",
  ticketDetails: "/my-tickets/:ticketId",
  organizerDashboard: "/organizer",
  organizerNewEvent: "/organizer/events/new",
  gateValidation: "/gate",
} as const;

export function eventDetailsPath(eventId: string) {
  return `/events/${eventId}`;
}

export function checkoutPath(eventId: string) {
  return `/events/${eventId}/checkout`;
}

export function ticketDetailsPath(ticketId: string) {
  return `/my-tickets/${ticketId}`;
}
