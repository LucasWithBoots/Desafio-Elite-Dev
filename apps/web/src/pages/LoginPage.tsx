import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogIn, ShieldCheck, Ticket, UserRound } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { UserRole } from "@/entities/user/model";
import { authService } from "@/features/auth/services/authService";
import { saveAuthSession } from "@/features/auth/services/authSession";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { routes } from "@/shared/constants/routes";

const demoCredentials: Record<UserRole, { email: string; password: string }> = {
  customer: { email: "cliente@elite.dev", password: "123456" },
  organizer: { email: "organizador@elite.dev", password: "123456" },
  gate: { email: "portaria@elite.dev", password: "123456" },
};

const roleDestinations: Record<UserRole, string> = {
  customer: routes.events,
  organizer: routes.organizerDashboard,
  gate: routes.gateValidation,
};

export function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<UserRole>("customer");
  const [formValues, setFormValues] = useState(demoCredentials.customer);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async (session) => {
      saveAuthSession(session);
      await queryClient.invalidateQueries();
      navigate(roleDestinations[session.user.role]);
    },
  });

  function selectRole(role: UserRole) {
    setSelectedRole(role);
    setFormValues(demoCredentials[role]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loginMutation.mutate({
      ...formValues,
      expectedRole: selectedRole,
    });
  }

  return (
    <section className="app-screen auth-layout">
      <header className="lime-page-header auth-hero">
        <span className="eyebrow">Elite Events</span>
        <h1>Entre para continuar</h1>
        <p>Escolha um perfil de teste e percorra o fluxo completo.</p>
      </header>

      <form className="panel auth-panel" onSubmit={handleSubmit}>
        <Input
          label="E-mail"
          name="email"
          type="email"
          placeholder="cliente@elite.dev"
          value={formValues.email}
          onChange={(event) =>
            setFormValues((current) => ({ ...current, email: event.target.value }))
          }
        />
        <Input
          label="Senha"
          name="password"
          type="password"
          placeholder="123456"
          value={formValues.password}
          onChange={(event) =>
            setFormValues((current) => ({ ...current, password: event.target.value }))
          }
        />
        <div className="role-picker" aria-label="Perfis de teste">
          <button
            className={`role-option ${selectedRole === "customer" ? "role-option-active" : ""}`}
            type="button"
            onClick={() => selectRole("customer")}
          >
            <UserRound size={18} aria-hidden="true" />
            Cliente
          </button>
          <button
            className={`role-option ${selectedRole === "organizer" ? "role-option-active" : ""}`}
            type="button"
            onClick={() => selectRole("organizer")}
          >
            <ShieldCheck size={18} aria-hidden="true" />
            Organizador
          </button>
          <button
            className={`role-option ${selectedRole === "gate" ? "role-option-active" : ""}`}
            type="button"
            onClick={() => selectRole("gate")}
          >
            <Ticket size={18} aria-hidden="true" />
            Portaria
          </button>
        </div>
        <Button disabled={loginMutation.isPending}>
          <LogIn size={18} aria-hidden="true" />
          {loginMutation.isPending ? "Entrando..." : "Entrar"}
        </Button>
        {loginMutation.error ? (
          <p className="form-feedback">
            {loginMutation.error instanceof Error
              ? loginMutation.error.message
              : "Nao foi possivel entrar."}
          </p>
        ) : null}
      </form>
    </section>
  );
}
