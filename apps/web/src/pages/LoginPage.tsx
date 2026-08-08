import { LogIn } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";

export function LoginPage() {
  return (
    <section className="auth-layout">
      <div className="page-heading">
        <span className="eyebrow">Acesso</span>
        <h1>Entrar</h1>
        <p>Base para autenticar organizador, cliente e portaria com permissoes separadas.</p>
      </div>

      <form className="panel auth-panel">
        <Input label="E-mail" name="email" type="email" placeholder="cliente1@elite.dev" />
        <Input label="Senha" name="password" type="password" placeholder="123456" />
        <Button>
          <LogIn size={18} aria-hidden="true" />
          Entrar
        </Button>
      </form>
    </section>
  );
}
