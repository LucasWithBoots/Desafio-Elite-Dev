import { CalendarDays, QrCode, ShieldCheck, Ticket } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { routes } from "@/shared/constants/routes";

const navItems = [
  { to: routes.events, label: "Eventos", icon: CalendarDays },
  { to: routes.myTickets, label: "Meus ingressos", icon: Ticket },
  { to: routes.organizerDashboard, label: "Organizador", icon: ShieldCheck },
  { to: routes.gateValidation, label: "Portaria", icon: QrCode },
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
          {navItems.map((item) => {
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
    </div>
  );
}
