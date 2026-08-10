import {
  Bookmark,
  CalendarDays,
  Home,
  QrCode,
  Search,
  ShieldCheck,
  Ticket,
  UserRound,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { routes } from "@/shared/constants/routes";

const desktopNavItems = [
  { to: routes.events, label: "Eventos", icon: CalendarDays },
  { to: routes.myTickets, label: "Meus ingressos", icon: Ticket },
  { to: routes.organizerDashboard, label: "Organizador", icon: ShieldCheck },
  { to: routes.gateValidation, label: "Portaria", icon: QrCode },
];

const mobileNavItems = [
  { to: routes.events, label: "Home", icon: Home },
  { to: routes.events, label: "Buscar", icon: Search },
  { to: routes.myTickets, label: "Tickets", icon: Ticket },
  { to: routes.events, label: "Salvos", icon: Bookmark },
  { to: routes.login, label: "Perfil", icon: UserRound },
];

export function RootLayout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to={routes.events} className="brand" aria-label="Elite Events">
          <span className="brand-mark">E</span>
          <span>
            <strong>Elite Events</strong>
            <small>Eventos, ingressos e portaria</small>
          </span>
        </NavLink>

        <nav className="main-nav" aria-label="Navegacao principal">
          {desktopNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink key={item.to} to={item.to} className="nav-link">
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </header>

      <main className="page-shell">
        <Outlet />
      </main>

      <nav className="mobile-tabbar" aria-label="Navegacao do cliente">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isEventsShortcut = item.to === routes.events && item.label !== "Home";

          return (
            <NavLink
              key={`${item.label}-${item.to}`}
              to={item.to}
              className={({ isActive }) =>
                `mobile-tab ${isActive && !isEventsShortcut ? "active" : ""}`.trim()
              }
            >
              <Icon size={18} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
