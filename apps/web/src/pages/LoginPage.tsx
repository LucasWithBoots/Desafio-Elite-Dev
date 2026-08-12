import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogIn } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShowcase } from "@/features/auth/components/AuthShowcase";
import { authService } from "@/features/auth/services/authService";
import { saveAuthSession } from "@/features/auth/services/authSession";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { routes } from "@/shared/constants/routes";
import { AnimatePresence, motion } from "motion/react";

const demoCredentials = { email: "cliente@elite.dev", password: "123456" };

const roleDestinations = {
  customer: routes.events,
  organizer: routes.organizerDashboard,
  gate: routes.gateValidation,
} as const;

export function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState(demoCredentials);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async (session) => {
      saveAuthSession(session);
      await queryClient.invalidateQueries();
      navigate(roleDestinations[session.user.role]);
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loginMutation.mutate(formValues);
  }

  return (
    <AnimatePresence mode="wait">
      <motion.section
        className="app-screen auth-layout auth-visual-screen"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{
          duration: 0.25,
          ease: "easeOut",
        }}
      >
        <AuthShowcase />

        <form className="auth-glass-panel" onSubmit={handleSubmit}>
          <div className="auth-panel-heading">
            <span className="auth-carousel-indicator" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <h1>Entre na sua conta</h1>
            <p>Descubra eventos, salve favoritos e acompanhe seus tickets.</p>
          </div>
          <Input
            label="E-mail"
            name="email"
            type="email"
            placeholder="cliente@elite.dev"
            value={formValues.email}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
          />
          <Input
            label="Senha"
            name="password"
            type="password"
            placeholder="123456"
            value={formValues.password}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
          />
          <Button
            className="auth-submit-button"
            disabled={loginMutation.isPending}
          >
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
          <Link className="auth-create-link" to={routes.register}>
            Nao tem uma conta? <strong>Criar conta</strong>
          </Link>
        </form>
      </motion.section>
    </AnimatePresence>
  );
}
