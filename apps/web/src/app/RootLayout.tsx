import {
  Bookmark,
  CalendarDays,
  Home,
  PlusCircle,
  QrCode,
  Search,
  Ticket,
  UserRound,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { getHomePathForRole } from "@/features/auth/components/RoleRoute";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { routes } from "@/shared/constants/routes";

const customerDesktopNavItems = [
  { to: routes.events, label: "Eventos", icon: CalendarDays },
  { to: routes.search, label: "Buscar", icon: Search },
  { to: routes.myTickets, label: "Meus ingressos", icon: Ticket },
];

const customerMobileNavItems = [
  { to: routes.events, label: "Home", icon: Home },
  { to: routes.search, label: "Buscar", icon: Search },
  { to: routes.myTickets, label: "Tickets", icon: Ticket },
  { to: routes.events, label: "Salvos", icon: Bookmark },
  { to: routes.login, label: "Perfil", icon: UserRound },
];

const organizerNavItems = [
  { to: routes.organizerDashboard, label: "Perfil", icon: UserRound },
  { to: routes.organizerNewEvent, label: "Criar evento", icon: PlusCircle },
];

const gateNavItems = [
  { to: routes.gateValidation, label: "Portaria", icon: QrCode },
  { to: routes.login, label: "Perfil", icon: UserRound },
];

export function RootLayout() {
  const session = useAuthSession();
  const navItems = getNavItems(session?.user.role);
  const homePath = getHomePathForRole(session?.user.role);

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to={homePath} className="brand" aria-label="Elite Events">
          <span className="brand-mark">E</span>
          <span>
            <strong>Elite Events</strong>
            <small>{getBrandSubtitle(session?.user.role)}</small>
          </span>
        </NavLink>

        <nav className="main-nav" aria-label="Navegacao principal">
          {navItems.desktop.map((item) => {
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

      <nav className="mobile-tabbar" aria-label="Navegacao principal">
        {navItems.mobile.map((item) => {
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

function getNavItems(role?: string) {
  if (role === "organizer") {
    return {
      desktop: organizerNavItems,
      mobile: organizerNavItems,
    };
  }

  if (role === "gate") {
    return {
      desktop: gateNavItems,
      mobile: gateNavItems,
    };
  }

  return {
    desktop: customerDesktopNavItems,
    mobile: customerMobileNavItems,
  };
}

function getBrandSubtitle(role?: string) {
  if (role === "organizer") {
    return "Perfil e criacao de eventos";
  }

  if (role === "gate") {
    return "Validacao de ingressos";
  }

  return "Eventos, ingressos e portaria";
}
