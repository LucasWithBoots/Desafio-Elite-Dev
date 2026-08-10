import { LogIn, ShieldCheck, Ticket, UserRound } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";

export function LoginPage() {
  return (
    <section className="app-screen auth-layout">
      <header className="lime-page-header auth-hero">
        <span className="eyebrow">Elite Events</span>
        <h1>Entre para continuar</h1>
        <p>Escolha um perfil de teste e percorra o fluxo completo.</p>
      </header>

      <form className="panel auth-panel">
        <Input label="E-mail" name="email" type="email" placeholder="cliente1@elite.dev" />
        <Input label="Senha" name="password" type="password" placeholder="123456" />
        <div className="role-picker" aria-label="Perfis de teste">
          <button className="role-option role-option-active" type="button">
            <UserRound size={18} aria-hidden="true" />
            Cliente
          </button>
          <button className="role-option" type="button">
            <ShieldCheck size={18} aria-hidden="true" />
            Organizador
          </button>
          <button className="role-option" type="button">
            <Ticket size={18} aria-hidden="true" />
            Portaria
          </button>
        </div>
        <Button>
          <LogIn size={18} aria-hidden="true" />
          Entrar
        </Button>
      </form>
    </section>
  );
}
