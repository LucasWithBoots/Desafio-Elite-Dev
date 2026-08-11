import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, LogOut, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { UserRole } from "@/entities/user/model";
import { authService } from "@/features/auth/services/authService";
import { clearAuthSession } from "@/features/auth/services/authSession";
import { EmptyState } from "@/shared/components/EmptyState";
import { LoadingState } from "@/shared/components/LoadingState";
import { routes } from "@/shared/constants/routes";

interface ProfileAction {
  title: string;
  description: string;
  to: string;
  icon: LucideIcon;
}

const roleLabels: Record<UserRole, string> = {
  customer: "Cliente",
  organizer: "Organizador",
  gate: "Portaria",
};

const accountAction: ProfileAction = {
  title: "Dados da conta",
  to: routes.profileAccount,
  icon: UserRound,
};

export function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authService.me,
  });

  function handleLogout() {
    clearAuthSession();
    queryClient.clear();
    navigate(routes.login);
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !user) {
    return (
      <EmptyState
        title="Sessao indisponivel"
        description="Entre novamente para acessar seus dados de perfil."
        action={
          <Link className="button button-primary" to={routes.login}>
            Entrar
          </Link>
        }
      />
    );
  }

  return (
    <section className="app-screen profile-screen">
      <header className="profile-hero">
        <strong>Perfil</strong>
        <div className="profile-avatar" aria-hidden="true">
          {getInitials(user.name)}
        </div>
      </header>

      <section className="profile-identity" aria-label="Usuario logado">
        <h1>{user.name}</h1>
        <p>{user.email}</p>
        <span className="app-pill app-pill-pink">{roleLabels[user.role]}</span>
      </section>

      <section
        className="profile-menu-section"
        aria-labelledby="profile-menu-title"
      >
        <div className="profile-option-list">
          <ProfileActionLink action={accountAction} />

          <button
            className="profile-option profile-option-danger"
            type="button"
            onClick={handleLogout}
          >
            <span className="profile-option-icon">
              <LogOut size={18} aria-hidden="true" />
            </span>
            <span>
              <strong>Sair da conta</strong>
            </span>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </section>
    </section>
  );
}

function ProfileActionLink({ action }: { action: ProfileAction }) {
  const Icon = action.icon;

  return (
    <Link className="profile-option" to={action.to}>
      <span className="profile-option-icon">
        <Icon size={18} aria-hidden="true" />
      </span>
      <span>
        <strong>{action.title}</strong>
        <small>{action.description}</small>
      </span>
      <ChevronRight size={18} aria-hidden="true" />
    </Link>
  );
}

function getInitials(name: string) {
  const [firstName, secondName] = name.trim().split(/\s+/);
  const initials = `${firstName?.[0] ?? "E"}${secondName?.[0] ?? ""}`;

  return initials.toUpperCase();
}
