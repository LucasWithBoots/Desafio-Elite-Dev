import { createBrowserRouter, Navigate } from "react-router-dom";
import { RootLayout } from "./RootLayout";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { EventDetailsPage } from "@/pages/EventDetailsPage";
import { EventsPage } from "@/pages/EventsPage";
import { GateValidationPage } from "@/pages/GateValidationPage";
import { LoginPage } from "@/pages/LoginPage";
import { MyTicketsPage } from "@/pages/MyTicketsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { OrganizerDashboardPage } from "@/pages/OrganizerDashboardPage";
import { OrganizerEventFormPage } from "@/pages/OrganizerEventFormPage";
import { SearchPage } from "@/pages/SearchPage";
import { TicketDetailsPage } from "@/pages/TicketDetailsPage";
import { routes } from "@/shared/constants/routes";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to={routes.events} replace /> },
      { path: routes.login, element: <LoginPage /> },
      { path: routes.events, element: <EventsPage /> },
      { path: routes.search, element: <SearchPage /> },
      { path: routes.eventDetails, element: <EventDetailsPage /> },
      { path: routes.checkout, element: <CheckoutPage /> },
      { path: routes.myTickets, element: <MyTicketsPage /> },
      { path: routes.ticketDetails, element: <TicketDetailsPage /> },
      { path: routes.organizerDashboard, element: <OrganizerDashboardPage /> },
      { path: routes.organizerNewEvent, element: <OrganizerEventFormPage /> },
      { path: routes.gateValidation, element: <GateValidationPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
