import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "./RootLayout";
import {
  RoleHomeRedirect,
  RoleRoute,
} from "@/features/auth/components/RoleRoute";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { CheckoutSuccessPage } from "@/pages/CheckoutSuccessPage";
import { EventDetailsPage } from "@/pages/EventDetailsPage";
import { EventsPage } from "@/pages/EventsPage";
import { GateValidationPage } from "@/pages/GateValidationPage";
import { LoginPage } from "@/pages/LoginPage";
import { MyTicketsPage } from "@/pages/MyTicketsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { OrganizerDashboardPage } from "@/pages/OrganizerDashboardPage";
import { OrganizerEventFormPage } from "@/pages/OrganizerEventFormPage";
import { SavedEventsPage } from "@/pages/SavedEventsPage";
import { SearchPage } from "@/pages/SearchPage";
import { TicketDetailsPage } from "@/pages/TicketDetailsPage";
import { routes } from "@/shared/constants/routes";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <RoleHomeRedirect /> },
      { path: routes.login, element: <LoginPage /> },
      {
        path: routes.events,
        element: (
          <RoleRoute allowedRoles={["customer"]} allowGuest>
            <EventsPage />
          </RoleRoute>
        ),
      },
      {
        path: routes.search,
        element: (
          <RoleRoute allowedRoles={["customer"]} allowGuest>
            <SearchPage />
          </RoleRoute>
        ),
      },
      {
        path: routes.savedEvents,
        element: (
          <RoleRoute allowedRoles={["customer"]}>
            <SavedEventsPage />
          </RoleRoute>
        ),
      },
      {
        path: routes.eventDetails,
        element: (
          <RoleRoute allowedRoles={["customer"]} allowGuest>
            <EventDetailsPage />
          </RoleRoute>
        ),
      },
      {
        path: routes.checkout,
        element: (
          <RoleRoute allowedRoles={["customer"]}>
            <CheckoutPage />
          </RoleRoute>
        ),
      },
      {
        path: routes.checkoutSuccess,
        element: (
          <RoleRoute allowedRoles={["customer"]}>
            <CheckoutSuccessPage />
          </RoleRoute>
        ),
      },
      {
        path: routes.myTickets,
        element: (
          <RoleRoute allowedRoles={["customer"]}>
            <MyTicketsPage />
          </RoleRoute>
        ),
      },
      {
        path: routes.ticketDetails,
        element: (
          <RoleRoute allowedRoles={["customer"]}>
            <TicketDetailsPage />
          </RoleRoute>
        ),
      },
      {
        path: routes.organizerDashboard,
        element: (
          <RoleRoute allowedRoles={["organizer"]}>
            <OrganizerDashboardPage />
          </RoleRoute>
        ),
      },
      {
        path: routes.organizerNewEvent,
        element: (
          <RoleRoute allowedRoles={["organizer"]}>
            <OrganizerEventFormPage />
          </RoleRoute>
        ),
      },
      {
        path: routes.gateValidation,
        element: (
          <RoleRoute allowedRoles={["gate"]}>
            <GateValidationPage />
          </RoleRoute>
        ),
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
