import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShowcase } from "@/features/auth/components/AuthShowcase";
import { authService } from "@/features/auth/services/authService";
import { saveAuthSession } from "@/features/auth/services/authSession";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { routes } from "@/shared/constants/routes";

export function RegisterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: async (session) => {
      saveAuthSession(session);
      await queryClient.invalidateQueries();
      navigate(routes.events);
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    registerMutation.mutate(formValues);
  }

  return (
    <section className="app-screen auth-layout auth-visual-screen">
      <AuthShowcase />

      <form className="auth-glass-panel" onSubmit={handleSubmit}>
        <div className="auth-panel-heading">
          <span className="auth-carousel-indicator" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <h1>Crie sua conta</h1>
          <p>Entre no Elite Events para salvar eventos e comprar tickets.</p>
        </div>
        <Input
          label="Nome"
          name="name"
          type="text"
          placeholder="Seu nome"
          value={formValues.name}
          onChange={(event) =>
            setFormValues((current) => ({ ...current, name: event.target.value }))
          }
        />
        <Input
          label="E-mail"
          name="email"
          type="email"
          placeholder="voce@email.com"
          value={formValues.email}
          onChange={(event) =>
            setFormValues((current) => ({ ...current, email: event.target.value }))
          }
        />
        <Input
          label="Senha"
          name="password"
          type="password"
          placeholder="Minimo 6 caracteres"
          value={formValues.password}
          onChange={(event) =>
            setFormValues((current) => ({ ...current, password: event.target.value }))
          }
        />
        <Button className="auth-submit-button" disabled={registerMutation.isPending}>
          <UserPlus size={18} aria-hidden="true" />
          {registerMutation.isPending ? "Criando..." : "Criar conta"}
        </Button>
        {registerMutation.error ? (
          <p className="form-feedback">
            {registerMutation.error instanceof Error
              ? registerMutation.error.message
              : "Nao foi possivel criar sua conta."}
          </p>
        ) : null}
        <Link className="auth-create-link" to={routes.login}>
          Ja tem uma conta? <strong>Entrar</strong>
        </Link>
      </form>
    </section>
  );
}
