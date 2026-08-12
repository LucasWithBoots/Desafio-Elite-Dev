import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Fingerprint,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import type { UserRole } from "@/entities/user/model";
import { authService } from "@/features/auth/services/authService";
import { EmptyState } from "@/shared/components/EmptyState";
import { LoadingState } from "@/shared/components/LoadingState";
import { routes } from "@/shared/constants/routes";

const roleLabels: Record<UserRole, string> = {
  customer: "Cliente",
  organizer: "Organizador",
  gate: "Portaria",
};

const roleDescriptions: Record<UserRole, string> = {
  customer: "Compra, salva e acessa ingressos.",
  organizer: "Publica eventos e acompanha vendas.",
  gate: "Valida ingressos na entrada.",
};

export function ProfileAccountPage() {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authService.me,
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !user) {
    return (
      <EmptyState
        title="Sessao indisponivel"
        description="Entre novamente para acessar os dados da conta."
        action={
          <Link className="button button-primary" to={routes.login}>
            Entrar
          </Link>
        }
      />
    );
  }

  return (
    <section className="app-screen profile-account-screen">
      <header className="profile-account-header">
        <Link
          className="round-action"
          to={routes.profile}
          aria-label="Voltar para perfil"
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </Link>
        <div>
          <span className="eyebrow">Conta</span>
          <h1>Dados da conta</h1>
        </div>
      </header>

      <section
        className="profile-account-panel"
        aria-label="Dados nao editaveis da conta"
      >
        <ReadonlyAccountField
          label="Nome completo"
          value={user.name}
          icon={UserRound}
        />
        <ReadonlyAccountField label="Email" value={user.email} icon={Mail} />
        <ReadonlyAccountField
          label="Perfil"
          value={roleLabels[user.role]}
          icon={ShieldCheck}
        />
      </section>
    </section>
  );
}

function ReadonlyAccountField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <label className="profile-readonly-field">
      <span>
        <Icon size={18} aria-hidden="true" />
        {label}
      </span>
      <input readOnly aria-readonly="true" value={value} />
    </label>
  );
}
