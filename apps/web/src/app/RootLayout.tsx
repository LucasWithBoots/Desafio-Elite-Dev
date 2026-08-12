import {
  Bookmark,
  CalendarDays,
  Home,
  LogOut,
  PlusCircle,
  QrCode,
  Search,
  Ticket,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { getHomePathForRole } from "@/features/auth/components/RoleRoute";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { clearAuthSession } from "@/features/auth/services/authSession";
import { routes } from "@/shared/constants/routes";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const customerDesktopNavItems: NavItem[] = [
  { to: routes.events, label: "Eventos", icon: CalendarDays },
  { to: routes.search, label: "Buscar", icon: Search },
  { to: routes.savedEvents, label: "Salvos", icon: Bookmark },
  { to: routes.myTickets, label: "Meus ingressos", icon: Ticket },
  { to: routes.profile, label: "Perfil", icon: UserRound },
];

const customerMobileNavItems: NavItem[] = [
  { to: routes.events, label: "Home", icon: Home },
  { to: routes.search, label: "Buscar", icon: Search },
  { to: routes.myTickets, label: "Tickets", icon: Ticket },
  { to: routes.savedEvents, label: "Salvos", icon: Bookmark },
  { to: routes.profile, label: "Perfil", icon: UserRound },
];

const organizerNavItems: NavItem[] = [
  { to: routes.organizerDashboard, label: "Home", icon: Home },
  { to: routes.organizerNewEvent, label: "Criar evento", icon: PlusCircle },
  { to: routes.profile, label: "Perfil", icon: UserRound },
];

const gateNavItems: NavItem[] = [
  { to: routes.gateValidation, label: "Portaria", icon: QrCode },
  { to: routes.profile, label: "Perfil", icon: UserRound },
];

export function RootLayout() {
  const session = useAuthSession();
  const location = useLocation();
  const navigate = useNavigate();
  const shellRole = session?.user.role ?? "guest";
  const navItems = getNavItems(session?.user.role);
  const homePath = getHomePathForRole(session?.user.role);
  const isClientHome =
    location.pathname === routes.events &&
    (!session || session.user.role === "customer");
  const shouldHideMobileTabbar =
    location.pathname === routes.login ||
    location.pathname === routes.register ||
    /^\/events\/[^/]+\/checkout$/.test(location.pathname) ||
    location.pathname === routes.checkoutSuccess;
  const mobileItems = navItems.mobile;
  const mobileTabCount = mobileItems.length;
  const mobileTabStyle = {
    "--tab-count": mobileTabCount,
  } as CSSProperties;

  function handleLogout() {
    clearAuthSession();
    navigate(routes.login);
  }

  return (
    <div className={`app-shell app-shell-customer`}>
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
            const exactMatch = item.to === routes.organizerDashboard;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={exactMatch}
                className="nav-link"
              >
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          {session ? (
            <button
              className="nav-link nav-action-button"
              type="button"
              onClick={handleLogout}
            >
              <LogOut size={18} aria-hidden="true" />
              <span>Sair</span>
            </button>
          ) : null}
        </nav>
      </header>

      <main
        className={`page-shell ${
          shouldHideMobileTabbar ? "page-shell-immersive" : ""
        } ${isClientHome ? "page-shell-client-home" : ""}`.trim()}
      >
        <Outlet />
      </main>

      <nav
        className={`mobile-tabbar ${shouldHideMobileTabbar ? "mobile-tabbar-hidden" : ""}`}
        aria-label="Navegacao principal"
        style={mobileTabStyle}
      >
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const exactMatch = item.to === routes.organizerDashboard;

          return (
            <NavLink
              key={`${item.label}-${item.to}`}
              to={item.to}
              end={exactMatch}
              className={({ isActive }) =>
                `mobile-tab ${isActive ? "active" : ""}`.trim()
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
